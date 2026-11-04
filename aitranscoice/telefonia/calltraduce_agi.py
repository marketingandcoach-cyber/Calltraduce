#!/usr/bin/env python3
"""Asterisk AGI adapter for the local SeamlessExpressive endpoint."""

import re
import subprocess
import sys
from pathlib import Path
from urllib.request import Request, urlopen

SPOOL = Path("/var/spool/asterisk/calltraduce")
ENDPOINT = "http://127.0.0.1:3000/api/meta/expressive?from=es-ES&to=en-US"
MAX_RESPONSE = 5 * 1024 * 1024


def translate(source, raw, playback):
    request = Request(
        ENDPOINT, data=source.read_bytes(), headers={"Content-Type": "audio/wav"}
    )
    with urlopen(request, timeout=130) as response:
        audio = response.read(MAX_RESPONSE + 1)
        if response.headers.get_content_type() != "audio/wav" or len(audio) > MAX_RESPONSE:
            raise ValueError("Invalid audio response")
    raw.write_bytes(audio)
    subprocess.run(
        ["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(raw),
         "-ac", "1", "-ar", "8000", "-c:a", "pcm_s16le", str(playback)],
        check=True, timeout=10, stdout=subprocess.DEVNULL,
    )


def main():
    for line in sys.stdin:
        if not line.strip():
            break

    if len(sys.argv) != 3 or not re.fullmatch(r"[A-Za-z0-9_.-]{1,100}", sys.argv[2]):
        return 1
    action, call_id = sys.argv[1:]
    source = SPOOL / f"{call_id}-source.wav"
    raw = SPOOL / f"{call_id}-model.wav"
    playback = SPOOL / f"{call_id}-translated.wav"

    if action == "cleanup":
        for file in (source, raw, playback):
            file.unlink(missing_ok=True)
        return 0
    if action != "translate":
        return 1

    result = "ERROR"
    try:
        translate(source, raw, playback)
        result = "OK"
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        print(f"Calltraduce: {type(error).__name__}", file=sys.stderr)
    finally:
        source.unlink(missing_ok=True)
        raw.unlink(missing_ok=True)

    print(f"SET VARIABLE CALLTRADUCE_RESULT {result}", flush=True)
    sys.stdin.readline()
    return 0


if __name__ == "__main__":
    sys.exit(main())

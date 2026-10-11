#!/usr/bin/env python3
"""Check whether this machine can access the gated external Idoma ASR model.

Authentication stays outside the repository. Use the normal Hugging Face login
mechanism or set HF_TOKEN in the runtime environment. Never commit a token.
"""

from __future__ import annotations

import os
import sys

from huggingface_hub import HfApi
from huggingface_hub.errors import GatedRepoError, HfHubHTTPError

MODEL_ID = "mrheartng/wav2vec2-xls-r-1b-finetuned-idoma"


def main() -> int:
    token = os.getenv("HF_TOKEN") or None
    api = HfApi(token=token)

    try:
        info = api.model_info(MODEL_ID)
    except GatedRepoError:
        print("PENDING: this Hugging Face account does not yet have access to the Idoma model.")
        print("Wait for the repository author to approve the access request, then run this check again.")
        return 2
    except HfHubHTTPError as exc:
        print(f"Hugging Face access check failed: {exc}", file=sys.stderr)
        return 1

    print("READY: the Idoma ASR repository is accessible from this authenticated environment.")
    print(f"Model: {info.id}")
    print(f"Revision: {info.sha or 'unknown'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

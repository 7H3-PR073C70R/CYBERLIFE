# Provider adapters

The first implementation uses the public Poly Haven API in `core/manager.py`.
The interface is intentionally isolated around search, file-tree lookup, and download.
Additional adapters (for example ambientCG and Sketchfab) should be added only after
their current APIs, authentication requirements, rate limits, and licenses are verified.

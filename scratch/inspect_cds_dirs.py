import os
import glob

cds_dir = "/Users/ggdayup/ggdayup-syncthing/code/CollegeFlow/data/cds/CollegeFlow_CDS/cds_data"
subdirs = sorted(os.listdir(cds_dir))

for subdir in subdirs:
    subpath = os.path.join(cds_dir, subdir)
    if os.path.isdir(subpath):
        files = os.listdir(subpath)
        print(f"[{subdir}] has {len(files)} files:")
        for file in files:
            if not file.startswith('.'):
                print(f"  - {file}")

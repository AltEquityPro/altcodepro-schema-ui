import os


def collect_typescript_files(src_dir: str, output_file: str):
    """
    Walk through the src_dir and combine all .ts and .tsx files
    into a single output file.
    """
    ts_extensions = (".ts", ".tsx")

    with open(output_file, "w", encoding="utf-8") as outfile:
        for subdir, _, files in os.walk(src_dir):
            for file in sorted(files):  # sort for consistent order
                if file.endswith(ts_extensions):
                    file_path = os.path.join(subdir, file)
                    try:
                        with open(file_path, "r", encoding="utf-8") as infile:
                            outfile.write(f"\n\n// === File: {file_path} ===\n\n")
                            outfile.write(infile.read())
                    except Exception as e:
                        print(f"⚠️ Could not read {file_path}: {e}")


if __name__ == "__main__":
    src_dir = "src"  # only read from ./src
    output_file = "all_src_code_combined.tsx"
    collect_typescript_files(src_dir, output_file)
    print(f"✅ Combined TypeScript/React code from {src_dir}/ saved to {output_file}")

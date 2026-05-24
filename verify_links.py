
import os

trae_skills_dir = '/Users/ggdayup/.trae/skills'
agents_skills_dir = '/Users/ggdayup/.agents/skills'

items = [item for item in os.listdir(trae_skills_dir) if not item.startswith('.')]

print("=== .trae/skills 中的所有链接（共 {} 个）:\n".format(len(items)))

for item in sorted(items):
    path = os.path.join(trae_skills_dir, item)
    if os.path.islink(path):
        target = os.readlink(path)
        # 验证目标是否存在
        target_path = os.path.normpath(os.path.join(trae_skills_dir, target))
        if os.path.exists(target_path):
            print("✓ {} -&gt; {} (有效)".format(item, target))
        else:
            print("✗ {} -&gt; {} (无效)".format(item, target))
    else:
        print("⚠  {} (非链接)".format(item))

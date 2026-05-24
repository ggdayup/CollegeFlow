
import os

# 获取两个目录的路径
trae_skills_dir = '/Users/ggdayup/.trae/skills'
agents_skills_dir = '/Users/ggdayup/.agents/skills'

# 获取 .trae/skills 中已有的链接名称
trae_link_names = set()
for item in os.listdir(trae_skills_dir):
    if item.startswith('.'):
        continue
    trae_link_names.add(item)

# 获取 .agents/skills 中的所有 skill
agents_skills = []
for item in sorted(os.listdir(agents_skills_dir)):
    if item.startswith('.') or item == 'doc.md':
        continue
    item_path = os.path.join(agents_skills_dir, item)
    if os.path.isdir(item_path):
        agents_skills.append(item)

print("=== 完整分析报告 ===\n")

print("1. .trae/skills 中的现有链接（{} 个）:".format(len(trae_link_names)))
for name in sorted(trae_link_names):
    path = os.path.join(trae_skills_dir, name)
    if os.path.islink(path):
        target = os.readlink(path)
        print("  - {} -&gt; {}".format(name, target))
    else:
        print("  - {} (非链接)".format(name))

print("\n2. .agents/skills 中的 skill 目录（{} 个）:".format(len(agents_skills)))
for skill in agents_skills:
    print("  - {}".format(skill))

# 计算需要创建的链接
skills_to_link = []
for skill in agents_skills:
    # 对于 mattpocock_* 开头的，可能需要去掉前缀来匹配
    if skill.startswith('mattpocock_'):
        short_name = skill[len('mattpocock_'):]
        if short_name not in trae_link_names:
            skills_to_link.append((skill, short_name))
    else:
        if skill not in trae_link_names:
            skills_to_link.append((skill, skill))

print("\n3. 需要创建的软链接（{} 个）:".format(len(skills_to_link)))
for skill, link_name in skills_to_link:
    # 计算相对路径：从 .trae/skills 到 .agents/skills
    # .trae/skills -&gt; ../../.agents/skills/&lt;skill&gt;
    relative_path = '../../.agents/skills/' + skill
    print("  - {} -&gt; {}".format(link_name, relative_path))

print("\n=== 方案 ===")
print("将为 {} 个 skill 在 /Users/ggdayup/.trae/skills 中创建软链接".format(len(skills_to_link)))
print("链接目标格式: ../../.agents/skills/&lt;skill-name&gt;")

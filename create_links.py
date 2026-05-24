
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

# 计算需要创建的链接
skills_to_link = []
for skill in agents_skills:
    if skill.startswith('mattpocock_'):
        short_name = skill[len('mattpocock_'):]
        if short_name not in trae_link_names:
            skills_to_link.append((skill, short_name))
    else:
        if skill not in trae_link_names:
            skills_to_link.append((skill, skill))

print("将创建 {} 个软链接...\n".format(len(skills_to_link)))

# 创建软链接
os.chdir(trae_skills_dir)
for skill, link_name in skills_to_link:
    target = '../../.agents/skills/' + skill
    try:
        os.symlink(target, link_name)
        print("✓ 创建链接: {} -&gt; {}".format(link_name, target))
    except FileExistsError:
        print("⚠  链接已存在: {}".format(link_name))
    except Exception as e:
        print("✗ 创建链接失败 {}: {}".format(link_name, e))

print("\n完成！")

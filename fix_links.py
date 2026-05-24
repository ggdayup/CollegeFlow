
import os

trae_skills_dir = '/Users/ggdayup/.trae/skills'
agents_skills_dir = '/Users/ggdayup/.agents/skills'

# 步骤 1: 删除所有无效的现有链接
print("=== 步骤 1: 清理无效链接 ===\n")
items = [item for item in os.listdir(trae_skills_dir) if not item.startswith('.')]
for item in items:
    path = os.path.join(trae_skills_dir, item)
    if os.path.islink(path):
        target = os.readlink(path)
        target_path = os.path.normpath(os.path.join(trae_skills_dir, target))
        if not os.path.exists(target_path):
            os.unlink(path)
            print("✗ 删除无效链接: {}".format(item))

# 步骤 2: 获取 .agents/skills 中的所有 skill
print("\n=== 步骤 2: 扫描所有 skill ===\n")
agents_skills = []
for item in sorted(os.listdir(agents_skills_dir)):
    if item.startswith('.') or item == 'doc.md':
        continue
    item_path = os.path.join(agents_skills_dir, item)
    if os.path.isdir(item_path):
        agents_skills.append(item)
        print("✓ 找到 skill: {}".format(item))

# 步骤 3: 为所有 skill 创建或更新链接
print("\n=== 步骤 3: 创建链接 ===\n")
os.chdir(trae_skills_dir)
for skill in agents_skills:
    # 确定链接名称
    if skill.startswith('mattpocock_'):
        link_name = skill[len('mattpocock_'):]
    else:
        link_name = skill
    
    target = '../../.agents/skills/' + skill
    
    # 如果链接已存在，先删除
    if os.path.islink(link_name) or os.path.exists(link_name):
        os.unlink(link_name)
    
    # 创建新链接
    os.symlink(target, link_name)
    print("✓ 创建/更新链接: {} -&gt; {}".format(link_name, target))

print("\n=== 完成！===")

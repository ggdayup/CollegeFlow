
import os

# 获取两个目录的路径
trae_skills_dir = '/Users/ggdayup/.trae/skills'
agent_skills_dir = '/Users/ggdayup/.agent/skills'

# 获取 .trae/skills 中已有的 skill（包括软链接指向的目标名称）
trae_skills = set()
for item in os.listdir(trae_skills_dir):
    if item.startswith('.'):
        continue
    item_path = os.path.join(trae_skills_dir, item)
    if os.path.islink(item_path):
        # 获取软链接的目标路径，并提取目录名
        target = os.readlink(item_path)
        target_name = os.path.basename(target)
        trae_skills.add(target_name)
    else:
        trae_skills.add(item)

# 获取 .agent/skills 中的所有 skill（排除系统文件）
agent_skills = set()
for item in os.listdir(agent_skills_dir):
    if item.startswith('.') or item == 'doc.md':
        continue
    agent_skills.add(item)

# 计算差异
missing = agent_skills - trae_skills
existing = agent_skills & trae_skills

print("=== 对比分析 ===")
print(f"\n.trae/skills 已有 skill 数量: {len(trae_skills)}")
print(f".agent/skills 中的 skill 数量: {len(agent_skills)}")
print(f"\n已存在的 skill（{len(existing)} 个）:")
for skill in sorted(existing):
    print(f"  - {skill}")

print(f"\n缺失的 skill（{len(missing)} 个）:")
for skill in sorted(missing):
    print(f"  - {skill}")

print(f"\n总结：需要为 {len(missing)} 个缺失的 skill 创建软链接")

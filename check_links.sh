
#!/bin/bash

cd /Users/ggdayup/.trae/skills
echo "=== .trae/skills 中的现有软链接 ==="
for link in *; do
    if [ -L "$link" ]; then
        target=$(readlink "$link")
        echo "  $link -&gt; $target"
        if [ -e "$target" ]; then
            echo "    [存在]"
        else
            echo "    [不存在]"
        fi
    fi
done

echo -e "\n=== .agent/skills 中的 skill 目录 ==="
cd /Users/ggdayup/.agent/skills
for skill in *; do
    if [ -d "$skill" ] &amp;&amp; [ ! "$skill" = ".system" ]; then
        echo "  $skill"
    fi
done

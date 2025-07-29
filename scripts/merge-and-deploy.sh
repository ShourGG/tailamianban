#!/bin/bash

# merge-and-deploy.sh - 功能分支发布自动化脚本
# 使用方法: ./merge-and-deploy.sh [可选:分支名]
# 流程: 当前feature分支 -> dev分支 -> main分支 -> 推送到所有远程仓库

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_highlight() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# 检查是否在git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "当前目录不是Git仓库！"
    exit 1
fi

# 检查分支是否存在
check_branch_exists() {
    local branch_name=$1
    if git show-ref --verify --quiet refs/heads/$branch_name; then
        return 0
    else
        return 1
    fi
}

# 检查远程仓库配置
check_remote() {
    local remote_name=$1
    if git remote get-url $remote_name > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 检查远程仓库连接
check_remote_connection() {
    local remote_name=$1
    if git ls-remote --exit-code $remote_name > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 安全推送函数
safe_push() {
    local remote_name=$1
    local branch_name=$2
    local remote_display_name=${3:-$remote_name}
    
    print_step "推送 $branch_name 分支到 $remote_display_name..."
    if git push $remote_name $branch_name; then
        print_success "已推送 $branch_name 分支到 $remote_display_name"
        return 0
    else
        print_error "推送 $branch_name 分支到 $remote_display_name 失败"
        print_warning "可能的原因："
        echo "  - 网络连接问题"
        echo "  - 权限不足"
        echo "  - 远程仓库不存在或无写入权限"
        echo "  - 分支被保护"
        return 1
    fi
}

# 安全合并函数
safe_merge() {
    local source_branch=$1
    local target_branch=$2
    
    print_step "合并 $source_branch 到 $target_branch..."
    if git merge $source_branch --no-edit; then
        print_success "合并 $source_branch 到 $target_branch 成功"
        return 0
    else
        print_error "合并 $source_branch 到 $target_branch 失败，存在冲突"
        print_warning "请按以下步骤解决："
        echo "  1. 使用 'git status' 查看冲突文件"
        echo "  2. 手动编辑冲突文件"
        echo "  3. 使用 'git add <文件>' 标记已解决"
        echo "  4. 使用 'git commit' 完成合并"
        echo "  5. 重新运行此脚本"
        return 1
    fi
}

# 推送到所有远程仓库
push_to_all_remotes() {
    local branch_name=$1
    local success_count=0
    local total_count=0
    
    # 推送到GitHub (origin)
    if check_remote "origin"; then
        total_count=$((total_count + 1))
        if check_remote_connection "origin"; then
            if safe_push "origin" "$branch_name" "GitHub"; then
                success_count=$((success_count + 1))
            fi
        else
            print_warning "无法连接到GitHub，跳过推送"
        fi
    else
        print_warning "未找到origin远程仓库配置"
    fi
    
    # 推送到Gitee
    local gitee_remote=""
    for remote in "gitee" "gitee-origin" "gitee-upstream"; do
        if check_remote $remote; then
            gitee_remote=$remote
            break
        fi
    done
    
    if [ -n "$gitee_remote" ]; then
        total_count=$((total_count + 1))
        if check_remote_connection $gitee_remote; then
            if safe_push $gitee_remote "$branch_name" "Gitee ($gitee_remote)"; then
                success_count=$((success_count + 1))
            fi
        else
            print_warning "无法连接到Gitee，跳过推送"
        fi
    else
        print_warning "未找到Gitee远程仓库配置"
    fi
    
    # 返回推送结果
    if [ $success_count -eq $total_count ] && [ $total_count -gt 0 ]; then
        return 0  # 全部成功
    elif [ $success_count -gt 0 ]; then
        return 1  # 部分成功
    else
        return 2  # 全部失败
    fi
}

# 获取版本信息
get_version() {
    if [ -f "package.json" ]; then
        grep '"version"' package.json | head -1 | cut -d'"' -f4
    else
        echo "未知"
    fi
}

echo -e "${PURPLE}🚀 功能分支发布自动化脚本启动...${NC}"
echo "================================================"

# 1. 获取当前分支和参数
FEATURE_BRANCH=""
if [ $# -eq 1 ]; then
    FEATURE_BRANCH=$1
    print_info "使用指定的功能分支: $FEATURE_BRANCH"
else
    FEATURE_BRANCH=$(git branch --show-current)
    print_info "使用当前分支: $FEATURE_BRANCH"
fi

# 2. 验证功能分支不是dev或main
if [ "$FEATURE_BRANCH" = "dev" ] || [ "$FEATURE_BRANCH" = "main" ]; then
    print_error "不能在 dev 或 main 分支上运行此脚本！"
    print_info "请切换到功能分支后重新运行"
    exit 1
fi

print_highlight "发布流程: $FEATURE_BRANCH → dev → main → 远程仓库"

# 3. 检查必要分支是否存在
print_step "检查分支存在性..."
for branch in "dev" "main"; do
    if ! check_branch_exists "$branch"; then
        print_error "$branch 分支不存在！请先创建 $branch 分支"
        exit 1
    fi
done

if ! check_branch_exists "$FEATURE_BRANCH"; then
    print_error "功能分支 $FEATURE_BRANCH 不存在！"
    exit 1
fi

print_success "所有必要分支都存在"

# 4. 检查工作区是否干净
print_step "检查工作区状态..."
if ! git diff-index --quiet HEAD --; then
    print_warning "工作区有未提交的更改，请先提交或暂存！"
    echo "使用 'git status' 查看详情："
    git status --short
    exit 1
fi

print_success "工作区状态干净"

# 5. 获取功能分支版本信息
FEATURE_VERSION=$(get_version)
print_info "功能分支版本: $FEATURE_VERSION"

# 6. 阶段一：切换到dev分支并合并功能分支
echo ""
echo "================================================"
print_highlight "阶段一：合并功能分支到dev分支"
echo "================================================"

print_step "切换到dev分支..."
git checkout dev

# 拉取最新的dev分支
if check_remote "origin" && check_remote_connection "origin"; then
    print_step "拉取最新的dev分支..."
    git pull origin dev
    print_success "dev分支已更新"
fi

# 合并功能分支到dev
if ! safe_merge "$FEATURE_BRANCH" "dev"; then
    print_error "合并失败，请手动解决冲突后重新运行"
    exit 1
fi

DEV_VERSION=$(get_version)
print_success "Dev分支合并完成，版本: $DEV_VERSION"

# 推送dev分支到所有远程仓库
print_step "推送dev分支到远程仓库..."
push_to_all_remotes "dev"
DEV_PUSH_RESULT=$?

# 7. 阶段二：切换到main分支并合并dev分支
echo ""
echo "================================================"
print_highlight "阶段二：合并dev分支到main分支"
echo "================================================"

print_step "切换到main分支..."
git checkout main

# 拉取最新的main分支
if check_remote "origin" && check_remote_connection "origin"; then
    print_step "拉取最新的main分支..."
    git pull origin main
    print_success "main分支已更新"
fi

# 合并dev到main
if ! safe_merge "dev" "main"; then
    print_error "合并失败，请手动解决冲突后重新运行"
    exit 1
fi

MAIN_VERSION=$(get_version)
print_success "Main分支合并完成，版本: $MAIN_VERSION"

# 推送main分支到所有远程仓库
print_step "推送main分支到远程仓库..."
push_to_all_remotes "main"
MAIN_PUSH_RESULT=$?

# 8. 显示发布结果总结
echo ""
echo "================================================"
print_highlight "🎉 发布流程完成！"
echo "================================================"

echo "📊 发布总结:"
echo "  - 功能分支: $FEATURE_BRANCH (版本: $FEATURE_VERSION)"
echo "  - Dev分支:  已合并 (版本: $DEV_VERSION)"
echo "  - Main分支: 已合并 (版本: $MAIN_VERSION)"

echo ""
echo "📍 远程仓库配置:"
git remote -v | grep -E "(origin|gitee)" | sort

echo ""
echo "🚀 推送结果:"
case $DEV_PUSH_RESULT in
    0) echo -e "  ${GREEN}✅ Dev分支: 推送成功${NC}" ;;
    1) echo -e "  ${YELLOW}⚠️  Dev分支: 部分推送成功${NC}" ;;
    2) echo -e "  ${RED}❌ Dev分支: 推送失败${NC}" ;;
esac

case $MAIN_PUSH_RESULT in
    0) echo -e "  ${GREEN}✅ Main分支: 推送成功${NC}" ;;
    1) echo -e "  ${YELLOW}⚠️  Main分支: 部分推送成功${NC}" ;;
    2) echo -e "  ${RED}❌ Main分支: 推送失败${NC}" ;;
esac

echo ""
echo "🌿 当前状态:"
echo "  - 当前分支: $(git branch --show-current)"
echo "  - 最新提交: $(git log --oneline -1)"

# 9. 询问是否删除功能分支
echo ""
if [ -t 0 ] && [ -t 1 ]; then  # 检查是否在交互式终端中
    read -p "是否删除功能分支 $FEATURE_BRANCH？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "删除功能分支 $FEATURE_BRANCH..."
        git branch -d $FEATURE_BRANCH
        print_success "功能分支 $FEATURE_BRANCH 已删除"
    else
        print_info "保留功能分支 $FEATURE_BRANCH"
    fi
else
    print_info "非交互模式，保留功能分支 $FEATURE_BRANCH"
fi

# 10. 后续操作建议
echo ""
echo -e "${YELLOW}💡 后续操作建议:${NC}"
echo "  1. 通知团队成员拉取最新的dev和main分支"
echo "  2. 检查GitHub和Gitee的分支状态"
echo "  3. 验证部署和功能是否正常"
echo "  4. 开始下一个功能的开发"

# 检查整体结果
if [ $DEV_PUSH_RESULT -eq 0 ] && [ $MAIN_PUSH_RESULT -eq 0 ]; then
    print_success "🎉 所有操作成功完成！"
    exit 0
elif [ $DEV_PUSH_RESULT -lt 2 ] && [ $MAIN_PUSH_RESULT -lt 2 ]; then
    print_warning "部分推送失败，但核心流程完成"
    exit 0
else
    print_error "存在推送失败，请检查网络连接和权限"
    exit 1
fi
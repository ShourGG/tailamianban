package service

// ModService Mod市场服务
type ModService struct{}

// NewModService 创建Mod服务
func NewModService() *ModService {
	return &ModService{}
}

// SearchWorkshopMods 搜索Workshop模组
func (s *ModService) SearchWorkshopMods(query string, page string) ([]map[string]interface{}, error) {
	// TODO: 实现Steam Workshop API调用
	// 这里返回模拟数据
	return []map[string]interface{}{
		{
			"id":          "2563784257",
			"name":        "Calamity Mod",
			"author":      "Fabsol",
			"description": "灾厄模组，添加大量新内容",
			"downloads":   5000000,
			"rating":      4.9,
			"thumbnail":   "https://example.com/calamity.jpg",
		},
		{
			"id":          "2563784258",
			"name":        "Thorium Mod",
			"author":      "DivermanSam",
			"description": "钍模组，添加新职业和BOSS",
			"downloads":   3000000,
			"rating":      4.8,
			"thumbnail":   "https://example.com/thorium.jpg",
		},
	}, nil
}

// GetPopularMods 获取热门模组
func (s *ModService) GetPopularMods(limit string) []map[string]interface{} {
	// 返回热门模组列表（模拟数据）
	return []map[string]interface{}{
		{
			"id":          "calamity",
			"name":        "Calamity Mod",
			"author":      "Fabsol",
			"description": "灾厄模组，添加大量新内容，包括新BOSS、新物品、新生物群落等",
			"version":     "2.0.3.8",
			"downloads":   5000000,
			"icon":        "https://example.com/calamity.png",
			"category":    "content",
		},
		{
			"id":          "thorium",
			"name":        "Thorium Mod",
			"author":      "DivermanSam",
			"description": "钍模组，添加新职业和BOSS",
			"version":     "1.7.3.2",
			"downloads":   3000000,
			"icon":        "https://example.com/thorium.png",
			"category":    "content",
		},
		{
			"id":          "magic-storage",
			"name":        "Magic Storage",
			"author":      "blushiemagic",
			"description": "魔法存储，提供强大的存储系统",
			"version":     "0.5.7.5",
			"downloads":   4000000,
			"icon":        "https://example.com/magic-storage.png",
			"category":    "utility",
		},
		{
			"id":          "fargos-mutant",
			"name":        "Fargo's Mutant Mod",
			"author":      "Fargowilta",
			"description": "法尔戈的突变模组，添加召唤物和便利功能",
			"version":     "2.6.0",
			"downloads":   2500000,
			"icon":        "https://example.com/fargos.png",
			"category":    "utility",
		},
	}
}

// GetTShockPlugins 获取TShock插件库
func (s *ModService) GetTShockPlugins(category string) []map[string]interface{} {
	plugins := []map[string]interface{}{
		{
			"id":          "ssc",
			"name":        "ServerSideCharacter (SSC)",
			"description": "服务器端人物存档，防止物品作弊",
			"version":     "1.2.0",
			"author":      "TShock Team",
			"category":    "essential",
			"downloads":   100000,
		},
		{
			"id":          "economics",
			"name":        "Economics",
			"description": "经济系统插件，支持货币、商店等功能",
			"version":     "1.5.2",
			"author":      "MistZZT",
			"category":    "gameplay",
			"downloads":   50000,
		},
		{
			"id":          "regions",
			"name":        "Regions",
			"description": "区域保护插件，可设置保护区域和权限",
			"version":     "2.0.1",
			"author":      "TShock Team",
			"category":    "protection",
			"downloads":   80000,
		},
		{
			"id":          "time-rate",
			"name":        "TimeRate",
			"description": "时间倍率插件，可加快或减慢游戏时间",
			"version":     "1.1.0",
			"author":      "Simon311",
			"category":    "utility",
			"downloads":   30000,
		},
		{
			"id":          "warps",
			"name":        "Warps",
			"description": "传送点插件，可设置多个传送点",
			"version":     "1.3.0",
			"author":      "Enerdy",
			"category":    "utility",
			"downloads":   40000,
		},
		{
			"id":          "chestcontrol",
			"name":        "ChestControl",
			"description": "箱子控制插件，可设置箱子权限和重生时间",
			"version":     "1.2.1",
			"author":      "Olink",
			"category":    "protection",
			"downloads":   25000,
		},
	}

	// 如果指定了分类，进行过滤
	if category != "" {
		filtered := []map[string]interface{}{}
		for _, plugin := range plugins {
			if plugin["category"] == category {
				filtered = append(filtered, plugin)
			}
		}
		return filtered
	}

	return plugins
}

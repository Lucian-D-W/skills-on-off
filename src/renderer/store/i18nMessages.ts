export type LocaleId = 'zh-TW' | 'zh-CN' | 'en'

export type MessageKey =
  | 'moreActions'
  | 'technicalDetails'
  | 'collectToSource'
  | 'sourceNotRecorded'
  | 'language'
  | 'githubImport'
  | 'newPair'
  | 'createPair'
  | 'editPair'
  | 'pairName'
  | 'projectionRule'
  | 'wholeSkillFolderProjection'
  | 'skillContentsProjection'
  | 'sourcePathLabel'
  | 'targetPathLabel'
  | 'browse'
  | 'cancel'
  | 'confirm'
  | 'processing'
  | 'edit'
  | 'delete'
  | 'noPairs'
  | 'pairEmptyHint'
  | 'createFirstPair'
  | 'loadPairsFailed'
  | 'fillAllFields'
  | 'pairCreated'
  | 'pairUpdated'
  | 'operationFailed'
  | 'deletePairConfirm'
  | 'deleted'
  | 'githubRepoUrl'
  | 'githubUrlPlaceholder'
  | 'preview'
  | 'previewing'
  | 'enterGithubUrlFirst'
  | 'previewGithubRepoFirst'
  | 'fillNameAndTargetFolder'
  | 'githubImportCompleted'
  | 'importedToCurrentProject'
  | 'linkedGithubRepo'
  | 'projectName'
  | 'targetFolder'
  | 'importType'
  | 'skillsWhitelist'
  | 'skillsWhitelistOption'
  | 'wholeFolder'
  | 'wholeFolderOption'
  | 'folderContents'
  | 'folderContentsOption'
  | 'agentFiles'
  | 'agentFilesOption'
  | 'skillsWhitelistHelp'
  | 'wholeFolderHelp'
  | 'folderContentsHelp'
  | 'agentFilesHelp'
  | 'projectionRuleHelpDirectory'
  | 'projectionRuleHelpContents'
  | 'repo'
  | 'branch'
  | 'subpath'
  | 'repoRoot'
  | 'suggestedTag'
  | 'canonical'
  | 'startImport'
  | 'importToCurrentProject'
  | 'confirmLink'
  | 'rescan'
  | 'all'
  | 'project'
  | 'function'
  | 'custom'
  | 'enabled'
  | 'sourcePath'
  | 'targetPath'
  | 'wholeSkill'
  | 'skillContents'
  | 'targetKind'
  | 'agentName'
  | 'rootPath'
  | 'layoutVersion'
  | 'metadataJson'
  | 'saveTarget'
  | 'toggleOn'
  | 'toggleOff'
  | 'uncategorized'
  | 'notRunYet'
  | 'notCreated'
  | 'noRemoteBaseline'
  | 'githubUpdateAvailable'
  | 'upToDateWithGithub'
  | 'checkFailed'
  | 'targetHealthy'
  | 'targetNeedsRepair'
  | 'syncStatusError'
  | 'singleRootSkillRepo'
  | 'multiSkillRepo'
  | 'subpathSkillRepo'
  | 'repoRootIsSkill'
  | 'nestedSkills'
  | 'subpathIsSkill'
  | 'stillManaged'
  | 'managementRemoved'
  | 'commonAgentFiles'
  | 'previewPlusMore'
  | 'saved'
  | 'closeFailed'
  | 'openFailed'
  | 'groupNothingToSync'
  | 'groupNothingToRemove'
  | 'syncFailed'
  | 'groupSyncedToTarget'
  | 'groupRemovedFromTarget'
  | 'batchPartialSync'
  | 'batchPartialRemove'
  | 'enterTagsFirst'
  | 'batchTagApplied'
  | 'removeSkillManagementConfirm'
  | 'removedSkillManagement'
  | 'removeGroupManagementConfirm'
  | 'removedGroupManagement'
  | 'noMatchingSkills'
  | 'selectSkillFirst'
  | 'linkGithubRepo'
  | 'importGithubProject'
  | 'linkGroupGithub'
  | 'targetSettings'
  | 'targetSettingsUpdated'
  | 'opened'
  | 'closed'
  | 'showEnabledOnly'
  | 'browseByTags'
  | 'selectedCount'
  | 'clear'
  | 'allOn'
  | 'allOff'
  | 'mixed'
  | 'abnormal'
  | 'untagged'
  | 'importProject'
  | 'groups'
  | 'items'
  | 'groupDetails'
  | 'selectedSkillCount'
  | 'selectSkillsForBatch'
  | 'append'
  | 'replace'
  | 'remove'
  | 'clearSelection'
  | 'groupCardHint'
  | 'openedCount'
  | 'wholeGroupRemoveManagement'
  | 'renameGroup'
  | 'renameGroupTitle'
  | 'renameGroupPlaceholder'
  | 'confirmRenameGroup'
  | 'renameGroupInvalidEmpty'
  | 'renameGroupInvalidMultiple'
  | 'groupRenamedSuccess'
  | 'relinkGithub'
  | 'skillCount'
  | 'noMatchingSkillsInGroup'
  | 'noUncategorizedSkills'
  | 'sourceMissingTargetExists'
  | 'active'
  | 'inactive'
  | 'noteTitle'
  | 'noteSubtitle'
  | 'notePlaceholder'
  | 'tagsTitle'
  | 'projectTags'
  | 'functionTags'
  | 'customTags'
  | 'projectTagsPlaceholder'
  | 'functionTagsPlaceholder'
  | 'customTagsPlaceholder'
  | 'pathAndStatusTitle'
  | 'pathAndStatusSubtitle'
  | 'sourceRepo'
  | 'targetDirectory'
  | 'tagCount'
  | 'installLedgerTitle'
  | 'installLedgerSubtitle'
  | 'ledgerStatus'
  | 'ledgerCreated'
  | 'ledgerMissing'
  | 'managementStatus'
  | 'installMode'
  | 'copyMode'
  | 'sourceShape'
  | 'sourceRelativePath'
  | 'finalInstallName'
  | 'rootWrap'
  | 'wrappedYes'
  | 'wrappedNo'
  | 'installReason'
  | 'customManagedCount'
  | 'customManagedPreview'
  | 'hint'
  | 'noImportRecordHint'
  | 'projectSourceAndTarget'
  | 'projectSourceTargetHint'
  | 'checkUpdates'
  | 'checking'
  | 'updateAndSync'
  | 'updating'
  | 'repairSync'
  | 'repairing'
  | 'githubStatus'
  | 'linked'
  | 'unlinked'
  | 'canonicalUrl'
  | 'defaultProjectTag'
  | 'notConfigured'
  | 'updateStatus'
  | 'syncHealth'
  | 'trayShowMainWindow'
  | 'trayQuit'
  | 'lastChecked'
  | 'lastSynced'
  | 'localVersion'
  | 'remoteVersion'
  | 'managedSkills'
  | 'enabledSkills'
  | 'staleSkills'
  | 'orphanTargets'
  | 'realValidation'
  | 'gstackValidationHint'
  | 'errorMessage'
  | 'targetCount'
  | 'primaryTarget'
  | 'targetType'
  | 'removing'
  | 'removeManagement'
  | 'restore'
  | 'saveChanges'
  | 'updateToMainRepo'
  | 'updatingToMainRepo'
  | 'lastUpdatedToMainRepo'
  | 'neverUpdatedToMainRepo'
  | 'targetMainRepoStatus'
  | 'targetMatchesMainRepo'
  | 'targetDiffersFromMainRepo'
  | 'targetMissingForPromotion'
  | 'targetPromotionUnsupported'
  | 'updateToMainRepoCompleted'
  | 'updateToMainRepoOverwriteWarning'
  | 'singleCategoryViewOnly'
  | 'batchTagging'
  | 'batchCategoryOnly'
  | 'batchTagEditing'
  | 'batchTagEditingHint'
  | 'batchTags'
  | 'applyMode'
  | 'appendToSelected'
  | 'replaceSelected'
  | 'removeFromSelected'
  | 'selectedSkills'
  | 'abnormalState'
  | 'syncedToTarget'
  | 'notSyncedToTarget'
  | 'searchSkillsNotesTags'
  | 'categoryGroups'
  | 'countGroups'
  | 'enterCategoryWithSpaces'
  | 'enterCategory'
  | 'skillStatus'
  | 'projectTagLabel'
  | 'switchToTheme'
  | 'projectNamePlaceholder'
  | 'skillDetailHint'

export type Messages = Record<MessageKey, string>


export const messages: Record<LocaleId, Messages> = {
  'zh-TW': {
    language: '語言',
    githubImport: 'GitHub 導入',
    newPair: '＋ 新增配對',
    createPair: '新增配對',
    editPair: '編輯配對',
    pairName: '配對名稱',
    projectionRule: '投影規則',
    wholeSkillFolderProjection: '整個 skill 文件夾複製',
    skillContentsProjection: 'skill 內部內容複製',
    sourcePathLabel: 'Skills 倉庫路徑（來源，唯讀）',
    targetPathLabel: '目標 Skills 資料夾（受控）',
    browse: '瀏覽…',
    cancel: '取消',
    confirm: '確認',
    processing: '處理中…',
    edit: '編輯',
    delete: '刪除',
    noPairs: '尚無任何配對',
    pairEmptyHint: '每個配對對應一個 Agent 的 Skills 目錄',
    createFirstPair: '＋ 建立第一個配對',
    loadPairsFailed: '讀取配對失敗：{message}',
    fillAllFields: '請填寫所有欄位',
    pairCreated: '已建立配對',
    pairUpdated: '已更新配對',
    operationFailed: '操作失敗：{message}',
    deletePairConfirm: '確定要刪除「{name}」？',
    deleted: '已刪除',
    githubRepoUrl: 'GitHub 倉庫地址',
    githubUrlPlaceholder: 'https://github.com/owner/repo 或 tree/branch/path',
    preview: '預覽',
    previewing: '預覽中…',
    enterGithubUrlFirst: '請先輸入 GitHub 地址',
    previewGithubRepoFirst: '請先預覽 GitHub 倉庫',
    fillNameAndTargetFolder: '請填寫名稱與目標資料夾',
    githubImportCompleted: 'GitHub 導入完成',
    importedToCurrentProject: '已導入到目前專案庫',
    linkedGithubRepo: '已關聯 GitHub 倉庫',
    projectName: '專案名稱',
    targetFolder: '目標資料夾',
    importType: '導入類型',
    skillsWhitelist: 'Skills（白名單）',
    skillsWhitelistOption: 'Skills（白名單）——適合多 skill 倉庫',
    wholeFolder: '整個資料夾',
    wholeFolderOption: '整個資料夾——適合把整個倉庫或單一資料夾原樣帶入',
    folderContents: '資料夾內文件',
    folderContentsOption: '資料夾內文件——適合只導入資料夾內內容、不保留外層資料夾',
    agentFiles: '常見 Agent 文件',
    agentFilesOption: '常見 Agent 文件——適合只提取 AGENTS.md、CLAUDE.md 等常見文件',
    skillsWhitelistHelp: '自動尋找包含 SKILL.md 的技能目錄（含 skills/ 等子目錄），逐個導入，並保留各技能的腳本與參考文件。',
    wholeFolderHelp: '將所選倉庫或子目錄完整作為一個項目導入；啟用時保留項目外層資料夾。',
    folderContentsHelp: '將所選目錄內的文件與子目錄作為一個項目管理；啟用時直接放入目標，不保留外層資料夾。',
    agentFilesHelp: '只提取所選目錄第一層的 AGENTS.md、CLAUDE.md；啟用時直接放入目標，不帶入其他文件。',
    projectionRuleHelpDirectory: '啟用時會保留最外層 skill 目錄。',
    projectionRuleHelpContents: '啟用時會把 skill 目錄內的內容直接投影到 target。',
    repo: '倉庫',
    branch: '分支',
    subpath: '子路徑',
    repoRoot: '倉庫根目錄',
    suggestedTag: '建議標籤',
    canonical: 'Canonical',
    startImport: '開始導入',
    importToCurrentProject: '導入到目前專案庫',
    confirmLink: '確認關聯',
    rescan: '↻ 重新掃描',
    all: '全部',
    project: '專案',
    function: '功能',
    custom: '自訂',
    enabled: '已啟用',
    sourcePath: '來源路徑',
    targetPath: '目標路徑',
    wholeSkill: '整個 skill',
    skillContents: 'skill 內容',
    targetKind: 'Target 類型',
    agentName: 'Agent 名稱',
    rootPath: 'Root Path',
    layoutVersion: 'Layout Version',
    metadataJson: 'Metadata JSON',
    saveTarget: '儲存 Target',
    toggleOn: '點擊開啟',
    toggleOff: '點擊關閉',
    uncategorized: '未分類',
    notRunYet: '尚未執行',
    notCreated: '尚未建立',
    noRemoteBaseline: '尚未建立遠端基線',
    githubUpdateAvailable: 'GitHub 有新版本',
    upToDateWithGithub: '已追上 GitHub',
    checkFailed: '檢查失敗',
    targetHealthy: 'Target 狀態正常',
    targetNeedsRepair: 'Target 需要修復',
    syncStatusError: '同步狀態異常',
    singleRootSkillRepo: '根目錄單 skill 倉庫',
    multiSkillRepo: '多 skill 倉庫',
    subpathSkillRepo: '子路徑 skill 倉庫',
    repoRootIsSkill: '倉庫根目錄就是 skill',
    nestedSkills: '子目錄承載多個 skills',
    subpathIsSkill: '指定子路徑才是 skill',
    stillManaged: '仍在管理中',
    managementRemoved: '已移除管理',
    commonAgentFiles: '常見 Agent 文件',
    previewPlusMore: '{preview} 等 {count} 項',
    saved: '已儲存',
    closeFailed: '關閉失敗',
    openFailed: '開啟失敗',
    groupNothingToSync: '這個分組目前沒有可同步的 skill',
    groupNothingToRemove: '這個分組目前沒有可移除的 skill',
    syncFailed: '同步失敗',
    groupSyncedToTarget: '已將 {groupName} 分組的 {count} 個 skill 同步到 target',
    groupRemovedFromTarget: '已將 {groupName} 分組的 {count} 個 skill 從 target 移除',
    batchPartialSync: '已同步 {done} 個，另有 {failed} 個失敗',
    batchPartialRemove: '已移除 {done} 個，另有 {failed} 個失敗',
    enterTagsFirst: '請先輸入要處理的標籤',
    batchTagApplied: '已對 {count} 個 skill 套用批量標籤',
    removeSkillManagementConfirm: '這會將它從目前專案的管理列表移除，並同步從 target 停用。來源記錄會保留，不會直接刪除磁碟檔案。',
    removedSkillManagement: '已從目前專案移除此 skill 的管理',
    removeGroupManagementConfirm: '這會把 #{projectTag} 分組下的 {count} 個 skill 從目前專案的管理列表移除，並一併從 target 停用。來源記錄會保留，不會直接刪除磁碟檔案。',
    removedGroupManagement: '已從目前專案移除此分組的管理',
    noMatchingSkills: '沒有符合條件的 skill',
    selectSkillFirst: '請先在左側選擇一個 skill',
    linkGithubRepo: '關聯 GitHub 倉庫',
    importGithubProject: '導入 GitHub 專案',
    linkGroupGithub: '關聯 {groupName} 的 GitHub',
    targetSettings: 'Target 設定',
    targetSettingsUpdated: 'Target 設定已更新',
    opened: '已開',
    closed: '已關',
    showEnabledOnly: '僅顯示已啟用 skill',
    browseByTags: '按標籤分組瀏覽',
    selectedCount: '{count} 個已選取',
    clear: '清除',
    allOn: '全開',
    allOff: '全關',
    mixed: '混合',
    abnormal: '異常',
    untagged: '尚未標記',
    importProject: '導入專案',
    groups: '組',
    items: '個',
    groupDetails: '{groupName} 分組詳情',
    selectedSkillCount: '已選 {count} 個 skill',
    selectSkillsForBatch: '先勾選 skill 再批量打標籤',
    append: '追加',
    replace: '覆蓋',
    remove: '移除',
    clearSelection: '清除選取',
    groupCardHint: '點擊查看這個分組的 skill 列表與批量操作。',
    openedCount: '已開啟 {count}',
    wholeGroupRemoveManagement: '整組移除管理',
    renameGroup: '重命名分組',
    renameGroupTitle: '重命名分組',
    renameGroupPlaceholder: '輸入新的分組標籤',
    confirmRenameGroup: '確認重命名',
    renameGroupInvalidEmpty: '請先輸入新的分組名稱',
    renameGroupInvalidMultiple: '分組名稱不能包含空格，請只輸入單一標籤',
    groupRenamedSuccess: '已將 #{oldTag} 重命名為 #{newTag}',
    relinkGithub: '重新關聯 GitHub',
    skillCount: '{count} 個 skill',
    noMatchingSkillsInGroup: '這個分組目前沒有符合條件的 skill',
    noUncategorizedSkills: '目前沒有未分類 skill',
    sourceMissingTargetExists: '目標存在但來源缺失',
    active: '已啟用',
    inactive: '未啟用',
    noteTitle: '備註',
    noteSubtitle: '',
    notePlaceholder: '輸入這個 skill 的用途或注意事項…',
    tagsTitle: '標籤',
    projectTags: '專案標籤',
    functionTags: '功能標籤',
    customTags: '自訂標籤',
    projectTagsPlaceholder: '例如：gsd docs desktop',
    functionTagsPlaceholder: '例如：search toggle batch',
    customTagsPlaceholder: '例如：favorite weekly keep',
    pathAndStatusTitle: '路徑與狀態',
    pathAndStatusSubtitle: '',
    sourceRepo: '來源倉庫',
    targetDirectory: '目標目錄',
    tagCount: '標籤總數',
    moreActions: '更多',
    technicalDetails: '技術詳情',
    collectToSource: '收錄到來源庫',
    sourceNotRecorded: '導入來源未記錄',
    installLedgerTitle: '導入資訊',
    installLedgerSubtitle: '記錄這個 skill 是怎麼被導入、為什麼這樣落盤，以及現在應該對應哪個目錄。',
    ledgerStatus: '帳本狀態',
    ledgerCreated: '已建立導入記錄',
    ledgerMissing: '尚未建立導入記錄',
    managementStatus: '管理狀態',
    installMode: '安裝模式',
    copyMode: '複製模式',
    sourceShape: '來源形態',
    sourceRelativePath: '來源相對路徑',
    finalInstallName: '最終安裝名',
    rootWrap: '根目錄包裹',
    wrappedYes: '是，已自動包成獨立資料夾',
    wrappedNo: '否',
    installReason: '安裝原因',
    customManagedCount: 'CUSTOM 受管內容數量',
    customManagedPreview: 'CUSTOM 受管內容預覽',
    hint: '提示',
    noImportRecordHint: '尚無導入來源記錄，不影響現有技能內容。',
    projectSourceAndTarget: '來源與同步',
    projectSourceTargetHint: '這裡直接做 GitHub 檢查、更新後重同步，以及 target 修復。',
    checkUpdates: '檢查更新',
    checking: '檢查中…',
    updateAndSync: '更新並同步',
    updating: '更新中…',
    repairSync: '修復同步',
    repairing: '修復中…',
    githubStatus: 'GitHub 狀態',
    linked: '已關聯',
    unlinked: '尚未關聯',
    canonicalUrl: 'Canonical URL',
    defaultProjectTag: '預設 Project Tag',
    notConfigured: '尚未設定',
    updateStatus: '更新狀態',
    syncHealth: '同步體檢',
    trayShowMainWindow: '顯示主視窗',
    trayQuit: '退出',
    lastChecked: '最後檢查',
    lastSynced: '最後同步',
    localVersion: '本地版本',
    remoteVersion: '遠端版本',
    managedSkills: '受管技能',
    enabledSkills: '已啟用技能',
    staleSkills: '需重同步',
    orphanTargets: '孤兒 Target',
    realValidation: '真實驗證',
    gstackValidationHint: '已識別到 gstack 真鏈路，可直接用來驗收 A-D 流程',
    errorMessage: '錯誤訊息',
    targetCount: 'Target 數量',
    primaryTarget: '主要 Target',
    targetType: 'Target 類型',
    removing: '移除中…',
    removeManagement: '移除管理',
    restore: '還原',
    saveChanges: '儲存變更',
    updateToMainRepo: '從目標更新到主倉庫',
    updatingToMainRepo: '更新中…',
    lastUpdatedToMainRepo: '最後更新到主倉庫',
    neverUpdatedToMainRepo: '尚未從目標更新回主倉庫',
    targetMainRepoStatus: '目標 / 主倉庫差異',
    targetMatchesMainRepo: '目標與主倉庫一致',
    targetDiffersFromMainRepo: '目標內容比主倉庫新或已不同步',
    targetMissingForPromotion: '目標目錄中找不到可回寫的 skill',
    targetPromotionUnsupported: '目前這種投影模式暫不支援從目標更新到主倉庫',
    updateToMainRepoCompleted: '已將目標中的最新 skill 更新回主倉庫',
    updateToMainRepoOverwriteWarning: '目標目錄與主倉庫中的 skill 不一致。繼續操作會覆蓋目標目錄中的目前版本。若要保留目標中的最新內容，請先點「從目標更新到主倉庫」。',
    singleCategoryViewOnly: '這個視圖只顯示 {category} 的編輯功能。',
    batchTagging: '批量打標籤',
    batchCategoryOnly: '已選取 {count} 個 skill。本頁只會批量處理 {category}。',
    batchTagEditing: '批量標籤編輯',
    batchTagEditingHint: '已選取 {count} 個 skill。輸入文字後可以批量追加、覆蓋或移除標籤；輸入規則和單個 skill 一樣，使用空格即可分隔。',
    batchTags: '批量標籤',
    applyMode: '套用方式',
    appendToSelected: '追加到選中項',
    replaceSelected: '覆蓋選中項',
    removeFromSelected: '從選中項移除',
    selectedSkills: '已選 skill',
    abnormalState: '異常狀態',
    syncedToTarget: '已同步到目標目錄',
    notSyncedToTarget: '尚未同步到目標目錄',
    searchSkillsNotesTags: '搜尋 skill、備註或標籤…',
    categoryGroups: '{category}分組',
    countGroups: '{count} 組',
    enterCategoryWithSpaces: '輸入 {category}，用空格分隔',
    enterCategory: '輸入 {category}',
    skillStatus: 'Skill 狀態',
    projectTagLabel: 'Project Tag',
    switchToTheme: '切換到 {theme}',
    projectNamePlaceholder: '例如：skill-flow',
    skillDetailHint: '',
  },
  'zh-CN': {
    language: '语言',
    githubImport: 'GitHub 导入',
    newPair: '＋ 新增配对',
    createPair: '新增配对',
    editPair: '编辑配对',
    pairName: '配对名称',
    projectionRule: '投影规则',
    wholeSkillFolderProjection: '整个 skill 文件夹复制',
    skillContentsProjection: 'skill 内部内容复制',
    sourcePathLabel: 'Skills 仓库路径（来源，只读）',
    targetPathLabel: '目标 Skills 文件夹（受控）',
    browse: '浏览…',
    cancel: '取消',
    confirm: '确认',
    processing: '处理中…',
    edit: '编辑',
    delete: '删除',
    noPairs: '还没有任何配对',
    pairEmptyHint: '每个配对对应一个 Agent 的 Skills 目录',
    createFirstPair: '＋ 创建第一个配对',
    loadPairsFailed: '读取配对失败：{message}',
    fillAllFields: '请填写所有字段',
    pairCreated: '已创建配对',
    pairUpdated: '已更新配对',
    operationFailed: '操作失败：{message}',
    deletePairConfirm: '确定要删除“{name}”吗？',
    deleted: '已删除',
    githubRepoUrl: 'GitHub 仓库地址',
    githubUrlPlaceholder: 'https://github.com/owner/repo 或 tree/branch/path',
    preview: '预览',
    previewing: '预览中…',
    enterGithubUrlFirst: '请先输入 GitHub 地址',
    previewGithubRepoFirst: '请先预览 GitHub 仓库',
    fillNameAndTargetFolder: '请填写名称和目标文件夹',
    githubImportCompleted: 'GitHub 导入完成',
    importedToCurrentProject: '已导入到当前项目库',
    linkedGithubRepo: '已关联 GitHub 仓库',
    projectName: '项目名称',
    targetFolder: '目标文件夹',
    importType: '导入类型',
    skillsWhitelist: 'Skills（白名单）',
    skillsWhitelistOption: 'Skills（白名单）——适合多 skill 仓库',
    wholeFolder: '整个文件夹',
    wholeFolderOption: '整个文件夹——适合把整个仓库或单一文件夹原样导入',
    folderContents: '文件夹内文件',
    folderContentsOption: '文件夹内文件——适合只导入文件夹内内容、不保留外层文件夹',
    agentFiles: '常见 Agent 文件',
    agentFilesOption: '常见 Agent 文件——适合只提取 AGENTS.md、CLAUDE.md 等常见文件',
    skillsWhitelistHelp: '自动寻找包含 SKILL.md 的技能目录（含 skills/ 等子目录），逐个导入，并保留各技能的脚本与参考文件。',
    wholeFolderHelp: '将所选仓库或子目录完整作为一个项目导入；启用时保留项目外层文件夹。',
    folderContentsHelp: '将所选目录内的文件与子目录作为一个项目管理；启用时直接放入目标，不保留外层文件夹。',
    agentFilesHelp: '只提取所选目录第一层的 AGENTS.md、CLAUDE.md；启用时直接放入目标，不带入其他文件。',
    projectionRuleHelpDirectory: '启用时会保留最外层 skill 目录。',
    projectionRuleHelpContents: '启用时会把 skill 目录里的内容直接投影到 target。',
    repo: '仓库',
    branch: '分支',
    subpath: '子路径',
    repoRoot: '仓库根目录',
    suggestedTag: '建议标签',
    canonical: 'Canonical',
    startImport: '开始导入',
    importToCurrentProject: '导入到当前项目库',
    confirmLink: '确认关联',
    rescan: '↻ 重新扫描',
    all: '全部',
    project: '项目',
    function: '功能',
    custom: '自定义',
    enabled: '已启用',
    sourcePath: '来源路径',
    targetPath: '目标路径',
    wholeSkill: '整个 skill',
    skillContents: 'skill 内容',
    targetKind: 'Target 类型',
    agentName: 'Agent 名称',
    rootPath: 'Root Path',
    layoutVersion: 'Layout Version',
    metadataJson: 'Metadata JSON',
    saveTarget: '保存 Target',
    toggleOn: '点击开启',
    toggleOff: '点击关闭',
    uncategorized: '未分类',
    notRunYet: '尚未执行',
    notCreated: '尚未建立',
    noRemoteBaseline: '尚未建立远端基线',
    githubUpdateAvailable: 'GitHub 有新版本',
    upToDateWithGithub: '已追上 GitHub',
    checkFailed: '检查失败',
    targetHealthy: 'Target 状态正常',
    targetNeedsRepair: 'Target 需要修复',
    syncStatusError: '同步状态异常',
    singleRootSkillRepo: '根目录单 skill 仓库',
    multiSkillRepo: '多 skill 仓库',
    subpathSkillRepo: '子路径 skill 仓库',
    repoRootIsSkill: '仓库根目录就是 skill',
    nestedSkills: '子目录承载多个 skills',
    subpathIsSkill: '指定子路径才是 skill',
    stillManaged: '仍在管理中',
    managementRemoved: '已移除管理',
    commonAgentFiles: '常见 Agent 文件',
    previewPlusMore: '{preview} 等 {count} 项',
    saved: '已保存',
    closeFailed: '关闭失败',
    openFailed: '开启失败',
    groupNothingToSync: '这个分组目前没有可同步的 skill',
    groupNothingToRemove: '这个分组目前没有可移除的 skill',
    syncFailed: '同步失败',
    groupSyncedToTarget: '已将 {groupName} 分组的 {count} 个 skill 同步到 target',
    groupRemovedFromTarget: '已将 {groupName} 分组的 {count} 个 skill 从 target 移除',
    batchPartialSync: '已同步 {done} 个，另有 {failed} 个失败',
    batchPartialRemove: '已移除 {done} 个，另有 {failed} 个失败',
    enterTagsFirst: '请先输入要处理的标签',
    batchTagApplied: '已对 {count} 个 skill 应用批量标签',
    removeSkillManagementConfirm: '这会将它从当前项目的管理列表移除，并同步从 target 停用。来源记录会保留，不会直接删除磁盘文件。',
    removedSkillManagement: '已从当前项目移除此 skill 的管理',
    removeGroupManagementConfirm: '这会把 #{projectTag} 分组下的 {count} 个 skill 从当前项目的管理列表移除，并一并从 target 停用。来源记录会保留，不会直接删除磁盘文件。',
    removedGroupManagement: '已从当前项目移除此分组的管理',
    noMatchingSkills: '没有符合条件的 skill',
    selectSkillFirst: '请先在左侧选择一个 skill',
    linkGithubRepo: '关联 GitHub 仓库',
    importGithubProject: '导入 GitHub 项目',
    linkGroupGithub: '关联 {groupName} 的 GitHub',
    targetSettings: 'Target 设置',
    targetSettingsUpdated: 'Target 设置已更新',
    opened: '已开',
    closed: '已关',
    showEnabledOnly: '仅显示已启用 skill',
    browseByTags: '按标签分组浏览',
    selectedCount: '已选 {count} 个',
    clear: '清除',
    allOn: '全开',
    allOff: '全关',
    mixed: '混合',
    abnormal: '异常',
    untagged: '尚未标记',
    importProject: '导入项目',
    groups: '组',
    items: '个',
    groupDetails: '{groupName} 分组详情',
    selectedSkillCount: '已选 {count} 个 skill',
    selectSkillsForBatch: '先勾选 skill 再批量打标签',
    append: '追加',
    replace: '覆盖',
    remove: '移除',
    clearSelection: '清除选取',
    groupCardHint: '点击查看这个分组的 skill 列表和批量操作。',
    openedCount: '已开启 {count}',
    wholeGroupRemoveManagement: '整组移除管理',
    renameGroup: '重命名分组',
    renameGroupTitle: '重命名分组',
    renameGroupPlaceholder: '输入新的分组标签',
    confirmRenameGroup: '确认重命名',
    renameGroupInvalidEmpty: '请先输入新的分组名称',
    renameGroupInvalidMultiple: '分组名称不能包含空格，请只输入单个标签',
    groupRenamedSuccess: '已将 #{oldTag} 重命名为 #{newTag}',
    relinkGithub: '重新关联 GitHub',
    skillCount: '{count} 个 skill',
    noMatchingSkillsInGroup: '这个分组当前没有符合条件的 skill',
    noUncategorizedSkills: '当前没有未分类 skill',
    sourceMissingTargetExists: '目标存在但来源缺失',
    active: '已启用',
    inactive: '未启用',
    noteTitle: '备注',
    noteSubtitle: '',
    notePlaceholder: '输入这个 skill 的用途或注意事项…',
    tagsTitle: '标签',
    projectTags: '项目标签',
    functionTags: '功能标签',
    customTags: '自定义标签',
    projectTagsPlaceholder: '例如：gsd docs desktop',
    functionTagsPlaceholder: '例如：search toggle batch',
    customTagsPlaceholder: '例如：favorite weekly keep',
    pathAndStatusTitle: '路径与状态',
    pathAndStatusSubtitle: '',
    sourceRepo: '来源仓库',
    targetDirectory: '目标目录',
    tagCount: '标签总数',
    moreActions: '更多',
    technicalDetails: '技术详情',
    collectToSource: '收录到来源库',
    sourceNotRecorded: '导入来源未记录',
    installLedgerTitle: '导入信息',
    installLedgerSubtitle: '记录这个 skill 是怎么导入的、为什么这样落盘，以及现在应该对应哪个目录。',
    ledgerStatus: '账本状态',
    ledgerCreated: '已建立导入记录',
    ledgerMissing: '尚未建立导入记录',
    managementStatus: '管理状态',
    installMode: '安装模式',
    copyMode: '复制模式',
    sourceShape: '来源形态',
    sourceRelativePath: '来源相对路径',
    finalInstallName: '最终安装名',
    rootWrap: '根目录包裹',
    wrappedYes: '是，已自动包成独立文件夹',
    wrappedNo: '否',
    installReason: '安装原因',
    customManagedCount: 'CUSTOM 受管内容数量',
    customManagedPreview: 'CUSTOM 受管内容预览',
    hint: '提示',
    noImportRecordHint: '尚无导入来源记录，不影响现有技能内容。',
    projectSourceAndTarget: '来源与同步',
    projectSourceTargetHint: '这里可以直接做 GitHub 检查、更新后重同步，以及 target 修复。',
    checkUpdates: '检查更新',
    checking: '检查中…',
    updateAndSync: '更新并同步',
    updating: '更新中…',
    repairSync: '修复同步',
    repairing: '修复中…',
    githubStatus: 'GitHub 状态',
    linked: '已关联',
    unlinked: '尚未关联',
    canonicalUrl: 'Canonical URL',
    defaultProjectTag: '默认 Project Tag',
    notConfigured: '尚未设置',
    updateStatus: '更新状态',
    syncHealth: '同步体检',
    trayShowMainWindow: '显示主窗口',
    trayQuit: '退出',
    lastChecked: '最后检查',
    lastSynced: '最后同步',
    localVersion: '本地版本',
    remoteVersion: '远端版本',
    managedSkills: '受管技能',
    enabledSkills: '已启用技能',
    staleSkills: '需重同步',
    orphanTargets: '孤儿 Target',
    realValidation: '真实验证',
    gstackValidationHint: '已识别到 gstack 真链路，可直接用来验收 A-D 流程',
    errorMessage: '错误信息',
    targetCount: 'Target 数量',
    primaryTarget: '主要 Target',
    targetType: 'Target 类型',
    removing: '移除中…',
    removeManagement: '移除管理',
    restore: '还原',
    saveChanges: '保存变更',
    updateToMainRepo: '从目标更新到主仓库',
    updatingToMainRepo: '更新中…',
    lastUpdatedToMainRepo: '最后更新到主仓库',
    neverUpdatedToMainRepo: '尚未从目标更新回主仓库',
    targetMainRepoStatus: '目标 / 主仓库差异',
    targetMatchesMainRepo: '目标与主仓库一致',
    targetDiffersFromMainRepo: '目标内容比主仓库新或已不同步',
    targetMissingForPromotion: '目标目录中找不到可回写的 skill',
    targetPromotionUnsupported: '当前这种投影模式暂不支持从目标更新到主仓库',
    updateToMainRepoCompleted: '已将目标中的最新 skill 更新回主仓库',
    updateToMainRepoOverwriteWarning: '目标目录与主仓库中的 skill 不一致。继续操作会覆盖目标目录中的当前版本。若要保留目标中的最新内容，请先点“从目标更新到主仓库”。',
    singleCategoryViewOnly: '这个视图只显示 {category} 的编辑功能。',
    batchTagging: '批量打标签',
    batchCategoryOnly: '已选中 {count} 个 skill。本页只会批量处理 {category}。',
    batchTagEditing: '批量标签编辑',
    batchTagEditingHint: '已选中 {count} 个 skill。输入文字后可以批量追加、覆盖或移除标签；输入规则和单个 skill 一样，使用空格即可分隔。',
    batchTags: '批量标签',
    applyMode: '应用方式',
    appendToSelected: '追加到选中项',
    replaceSelected: '覆盖选中项',
    removeFromSelected: '从选中项移除',
    selectedSkills: '已选 skill',
    abnormalState: '异常状态',
    syncedToTarget: '已同步到目标目录',
    notSyncedToTarget: '尚未同步到目标目录',
    searchSkillsNotesTags: '搜索 skill、备注或标签…',
    categoryGroups: '{category}分组',
    countGroups: '{count} 组',
    enterCategoryWithSpaces: '输入 {category}，用空格分隔',
    enterCategory: '输入 {category}',
    skillStatus: 'Skill 状态',
    projectTagLabel: 'Project Tag',
    switchToTheme: '切换到 {theme}',
    projectNamePlaceholder: '例如：skill-flow',
    skillDetailHint: '',
  },
  en: {
    language: 'Language',
    githubImport: 'GitHub Import',
    newPair: '+ New Pair',
    createPair: 'Create Pair',
    editPair: 'Edit Pair',
    pairName: 'Pair Name',
    projectionRule: 'Projection Rule',
    wholeSkillFolderProjection: 'Copy whole skill folder',
    skillContentsProjection: 'Copy skill contents only',
    sourcePathLabel: 'Skills repository path (source, read-only)',
    targetPathLabel: 'Target skills folder (managed)',
    browse: 'Browse…',
    cancel: 'Cancel',
    confirm: 'Confirm',
    processing: 'Processing…',
    edit: 'Edit',
    delete: 'Delete',
    noPairs: 'No pairs yet',
    pairEmptyHint: 'Each pair maps to one agent skills directory',
    createFirstPair: '+ Create your first pair',
    loadPairsFailed: 'Failed to load pairs: {message}',
    fillAllFields: 'Please fill in all fields',
    pairCreated: 'Pair created',
    pairUpdated: 'Pair updated',
    operationFailed: 'Operation failed: {message}',
    deletePairConfirm: 'Delete "{name}"?',
    deleted: 'Deleted',
    githubRepoUrl: 'GitHub repository URL',
    githubUrlPlaceholder: 'https://github.com/owner/repo or tree/branch/path',
    preview: 'Preview',
    previewing: 'Previewing…',
    enterGithubUrlFirst: 'Enter a GitHub URL first',
    previewGithubRepoFirst: 'Preview the GitHub repository first',
    fillNameAndTargetFolder: 'Please fill in the name and target folder',
    githubImportCompleted: 'GitHub import completed',
    importedToCurrentProject: 'Imported into the current project library',
    linkedGithubRepo: 'GitHub repository linked',
    projectName: 'Project Name',
    targetFolder: 'Target Folder',
    importType: 'Import Type',
    skillsWhitelist: 'Skills (whitelist)',
    skillsWhitelistOption: 'Skills (whitelist) — best for multi-skill repositories',
    wholeFolder: 'Whole folder',
    wholeFolderOption: 'Whole folder — best for importing a repo or folder as-is',
    folderContents: 'Folder contents',
    folderContentsOption: 'Folder contents — best for importing inner contents without the outer folder',
    agentFiles: 'Common agent files',
    agentFilesOption: 'Common agent files — best for extracting AGENTS.md, CLAUDE.md, and similar files',
    skillsWhitelistHelp: 'Find SKILL.md directories, including nested skills/ folders, and import each complete skill with its scripts and references.',
    wholeFolderHelp: 'Import the selected repository or subfolder intact as one item; enabling keeps its outer project folder.',
    folderContentsHelp: 'Manage the selected folder contents as one item; enabling places its files and subfolders directly in the target.',
    agentFilesHelp: 'Extract only top-level AGENTS.md and CLAUDE.md; enabling places these files directly in the target.',
    projectionRuleHelpDirectory: 'Keeps the outermost skill directory when enabled.',
    projectionRuleHelpContents: 'Projects the contents of the skill directory directly into the target.',
    repo: 'Repository',
    branch: 'Branch',
    subpath: 'Subpath',
    repoRoot: 'Repository root',
    suggestedTag: 'Suggested tag',
    canonical: 'Canonical',
    startImport: 'Start Import',
    importToCurrentProject: 'Import into Current Project',
    confirmLink: 'Confirm Link',
    rescan: '↻ Rescan',
    all: 'ALL',
    project: 'PROJECT',
    function: 'FUNCTION',
    custom: 'CUSTOM',
    enabled: 'ENABLED',
    sourcePath: 'Source Path',
    targetPath: 'Target Path',
    wholeSkill: 'Whole skill',
    skillContents: 'Skill contents',
    targetKind: 'Target Kind',
    agentName: 'Agent Name',
    rootPath: 'Root Path',
    layoutVersion: 'Layout Version',
    metadataJson: 'Metadata JSON',
    saveTarget: 'Save Target',
    toggleOn: 'Click to enable',
    toggleOff: 'Click to disable',
    uncategorized: 'Uncategorized',
    notRunYet: 'Not run yet',
    notCreated: 'Not created yet',
    noRemoteBaseline: 'No remote baseline yet',
    githubUpdateAvailable: 'GitHub update available',
    upToDateWithGithub: 'Up to date with GitHub',
    checkFailed: 'Check failed',
    targetHealthy: 'Target is healthy',
    targetNeedsRepair: 'Target needs repair',
    syncStatusError: 'Sync status error',
    singleRootSkillRepo: 'Single root skill repository',
    multiSkillRepo: 'Multi-skill repository',
    subpathSkillRepo: 'Subpath skill repository',
    repoRootIsSkill: 'Repository root is the skill',
    nestedSkills: 'Nested directories contain multiple skills',
    subpathIsSkill: 'The specified subpath is the skill',
    stillManaged: 'Still managed',
    managementRemoved: 'Management removed',
    commonAgentFiles: 'Common Agent Files',
    previewPlusMore: '{preview} and {count} more',
    saved: 'Saved',
    closeFailed: 'Disable failed',
    openFailed: 'Enable failed',
    groupNothingToSync: 'This group has no syncable skills right now',
    groupNothingToRemove: 'This group has no removable skills right now',
    syncFailed: 'Sync failed',
    groupSyncedToTarget: 'Synced {count} skills from {groupName} to target',
    groupRemovedFromTarget: 'Removed {count} skills from {groupName} from target',
    batchPartialSync: 'Synced {done}; {failed} failed',
    batchPartialRemove: 'Removed {done}; {failed} failed',
    enterTagsFirst: 'Enter tags first',
    batchTagApplied: 'Applied batch tags to {count} skills',
    removeSkillManagementConfirm: 'This removes it from the current project management list and disables it from the target. Source records are kept and no disk files are deleted directly.',
    removedSkillManagement: 'Removed management for this skill from the current project',
    removeGroupManagementConfirm: 'This removes all {count} skills under #{projectTag} from the current project management list and disables them from the target. Source records are kept and no disk files are deleted directly.',
    removedGroupManagement: 'Removed management for this group from the current project',
    noMatchingSkills: 'No matching skills',
    selectSkillFirst: 'Select a skill on the left first',
    linkGithubRepo: 'Link GitHub Repository',
    importGithubProject: 'Import GitHub Project',
    linkGroupGithub: 'Link GitHub for {groupName}',
    targetSettings: 'Target Settings',
    targetSettingsUpdated: 'Target settings updated',
    opened: 'On',
    closed: 'Off',
    showEnabledOnly: 'Showing enabled skills only',
    browseByTags: 'Browse by tag groups',
    selectedCount: '{count} selected',
    clear: 'Clear',
    allOn: 'All on',
    allOff: 'All off',
    mixed: 'Mixed',
    abnormal: 'Abnormal',
    untagged: 'Untagged',
    importProject: 'Import Project',
    groups: 'groups',
    items: 'items',
    groupDetails: '{groupName} Group Details',
    selectedSkillCount: '{count} skills selected',
    selectSkillsForBatch: 'Select skills before batch tagging',
    append: 'Append',
    replace: 'Replace',
    remove: 'Remove',
    clearSelection: 'Clear Selection',
    groupCardHint: 'Click to inspect this group and run batch actions.',
    openedCount: '{count} enabled',
    wholeGroupRemoveManagement: 'Remove Whole Group Management',
    renameGroup: 'Rename Group',
    renameGroupTitle: 'Rename Group',
    renameGroupPlaceholder: 'Enter a new group tag',
    confirmRenameGroup: 'Confirm Rename',
    renameGroupInvalidEmpty: 'Enter a new group name first',
    renameGroupInvalidMultiple: 'Group names cannot contain spaces. Enter a single tag only.',
    groupRenamedSuccess: 'Renamed #{oldTag} to #{newTag}',
    relinkGithub: 'Relink GitHub',
    skillCount: '{count} skills',
    noMatchingSkillsInGroup: 'No matching skills in this group right now',
    noUncategorizedSkills: 'No uncategorized skills right now',
    sourceMissingTargetExists: 'Target exists but source is missing',
    active: 'Active',
    inactive: 'Inactive',
    noteTitle: 'Notes',
    noteSubtitle: '',
    notePlaceholder: 'Describe the purpose or caveats of this skill…',
    tagsTitle: 'Tags',
    projectTags: 'Project Tags',
    functionTags: 'Function Tags',
    customTags: 'Custom Tags',
    projectTagsPlaceholder: 'e.g. gsd docs desktop',
    functionTagsPlaceholder: 'e.g. search toggle batch',
    customTagsPlaceholder: 'e.g. favorite weekly keep',
    pathAndStatusTitle: 'Paths & Status',
    pathAndStatusSubtitle: '',
    sourceRepo: 'Source Repository',
    targetDirectory: 'Target Directory',
    tagCount: 'Tag Count',
    moreActions: 'More',
    technicalDetails: 'Technical details',
    collectToSource: 'Add to source library',
    sourceNotRecorded: 'Import source not recorded',
    installLedgerTitle: 'Import information',
    installLedgerSubtitle: 'Tracks how this skill was imported, why it was laid out this way, and which directory it should map to now.',
    ledgerStatus: 'Ledger Status',
    ledgerCreated: 'Import record created',
    ledgerMissing: 'No import record yet',
    managementStatus: 'Management Status',
    installMode: 'Install Mode',
    copyMode: 'Copy Mode',
    sourceShape: 'Source Shape',
    sourceRelativePath: 'Source Relative Path',
    finalInstallName: 'Final Installed Name',
    rootWrap: 'Root Wrapper',
    wrappedYes: 'Yes, automatically wrapped into a separate folder',
    wrappedNo: 'No',
    installReason: 'Install Reason',
    customManagedCount: 'CUSTOM Managed Entries',
    customManagedPreview: 'CUSTOM Managed Preview',
    hint: 'Hint',
    noImportRecordHint: 'No import source is recorded. Existing skill files are unaffected.',
    projectSourceAndTarget: 'Source & sync',
    projectSourceTargetHint: 'Run GitHub checks, update-and-resync, and target repair directly here.',
    checkUpdates: 'Check Updates',
    checking: 'Checking…',
    updateAndSync: 'Update & Sync',
    updating: 'Updating…',
    repairSync: 'Repair Sync',
    repairing: 'Repairing…',
    githubStatus: 'GitHub Status',
    linked: 'Linked',
    unlinked: 'Not linked',
    canonicalUrl: 'Canonical URL',
    defaultProjectTag: 'Default Project Tag',
    notConfigured: 'Not configured',
    updateStatus: 'Update Status',
    syncHealth: 'Sync Health',
    trayShowMainWindow: 'Show Main Window',
    trayQuit: 'Quit',
    lastChecked: 'Last Checked',
    lastSynced: 'Last Synced',
    localVersion: 'Local Version',
    remoteVersion: 'Remote Version',
    managedSkills: 'Managed Skills',
    enabledSkills: 'Enabled Skills',
    staleSkills: 'Needs Resync',
    orphanTargets: 'Orphan Targets',
    realValidation: 'Real Validation',
    gstackValidationHint: 'A real gstack chain has been detected and can be used to validate flows A-D directly.',
    errorMessage: 'Error Message',
    targetCount: 'Target Count',
    primaryTarget: 'Primary Target',
    targetType: 'Target Type',
    removing: 'Removing…',
    removeManagement: 'Remove Management',
    restore: 'Restore',
    saveChanges: 'Save Changes',
    updateToMainRepo: 'Update from Target to Main Repo',
    updatingToMainRepo: 'Updating…',
    lastUpdatedToMainRepo: 'Last Updated to Main Repo',
    neverUpdatedToMainRepo: 'Never promoted from target yet',
    targetMainRepoStatus: 'Target / Main Repo Drift',
    targetMatchesMainRepo: 'Target matches the main repo',
    targetDiffersFromMainRepo: 'Target content is newer or no longer matches the main repo',
    targetMissingForPromotion: 'No promotable skill was found in the target directory',
    targetPromotionUnsupported: 'This projection mode does not support target-to-main promotion yet',
    updateToMainRepoCompleted: 'The latest target version has been copied back into the main repo',
    updateToMainRepoOverwriteWarning: 'The skill in target no longer matches the main repo. Continuing will overwrite the current target version. If you want to keep the latest target changes, update from target to the main repo first.',
    singleCategoryViewOnly: 'This view only edits {category}.',
    batchTagging: 'Batch Tagging',
    batchCategoryOnly: '{count} skills selected. This page only batch-edits {category}.',
    batchTagEditing: 'Batch Tag Editing',
    batchTagEditingHint: '{count} skills selected. You can append, replace, or remove tags in bulk; separate tags with spaces just like single-skill editing.',
    batchTags: 'Batch Tags',
    applyMode: 'Apply Mode',
    appendToSelected: 'Append to Selected',
    replaceSelected: 'Replace Selected',
    removeFromSelected: 'Remove from Selected',
    selectedSkills: 'Selected Skills',
    abnormalState: 'Abnormal State',
    syncedToTarget: 'Synced to target directory',
    notSyncedToTarget: 'Not synced to target directory',
    searchSkillsNotesTags: 'Search skills, notes, or tags…',
    categoryGroups: '{category} groups',
    countGroups: '{count} groups',
    enterCategoryWithSpaces: 'Enter {category}, separated by spaces',
    enterCategory: 'Enter {category}',
    skillStatus: 'Skill Status',
    projectTagLabel: 'Project Tag',
    switchToTheme: 'Switch to {theme}',
    projectNamePlaceholder: 'Example: skill-flow',
    skillDetailHint: '',
  },
}


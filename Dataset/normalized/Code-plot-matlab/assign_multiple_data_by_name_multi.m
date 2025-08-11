function assign_multiple_data_by_name_multi(folderPaths, nameHints, varNames)
    % folderPaths: 字符串或 cell 数组，每个元素是一个顶层文件夹路径
    % nameHints:   cell 数组，文件名关键词
    % varNames:    cell 数组，与 nameHints 一一对应

    if ischar(folderPaths) || isstring(folderPaths)
        folderPaths = {char(folderPaths)};
    end
    if numel(nameHints) ~= numel(varNames)
        error('nameHints 和 varNames 长度必须一致。');
    end

    % 汇总所有文件（递归）
    fileList = [];
    for f = 1:numel(folderPaths)
        thisDir = dir(fullfile(folderPaths{f}, '**', '*'));
        fileList = [fileList; thisDir(:)]; %#ok<AGROW>
    end
    fileList = fileList(~[fileList.isdir]);  % 仅保留文件

    for k = 1:numel(nameHints)
        nameHint = nameHints{k};
        varName  = varNames{k};
        matched  = {};

        fprintf('\n🔍 搜索 "%s"...\n', nameHint);
        for i = 1:numel(fileList)
            if contains(fileList(i).name, nameHint)
                fullPath = fullfile(fileList(i).folder, fileList(i).name);
                matched{end+1} = fullPath; %#ok<AGROW>
                fprintf('✅ %s\n', fullPath);
            end
        end

        if isempty(matched)
            warning('⚠️ 未找到包含 "%s" 的文件名（跨所有目录）。跳过。', nameHint);
            continue;
        elseif numel(matched) > 1
            fprintf('\n⚠️ 找到多个匹配文件：\n');
            for ii = 1:numel(matched)
                fprintf('%d: %s\n', ii, matched{ii});
            end
            choice = input('请输入你想使用的文件编号：');
            selectedFile = matched{choice};
        else
            selectedFile = matched{1};
        end

        % 读取数据
        try
            data = readmatrix(selectedFile);
        catch
            try
                data = dlmread(selectedFile);
            catch
                warning('⚠️ 无法读取文件 "%s"，跳过。', selectedFile);
                continue;
            end
        end

        assignin('base', varName, data);
        fprintf('💾 已保存为变量 "%s"\n', varName);
    end
end
%% =========================================================================
%  Spin-Dependent Fifth Force (SDFF) Constraints — Plotting Reference Script
%  Version: 1.0.0
%  Author: Lei Cong
%  License: MIT License
%  Last Updated: 2025-08-09
%
%  Description:
%  This MATLAB script loads multiple datasets from one or more
%  directories (including subdirectories), matches them by filename
%  hints, and plots them with customizable styles. 
%  It is intended as a standardized reference example for colleagues
%  to reproduce SDFF constraint plots with dual x-axes (force range and
%  mass) and logarithmic scaling.
%
%  Usage:
%  1. Set `folders`, `nameHints`, and `varNames` in the CONFIGURATION
%     section below.
%  2. Run the script in MATLAB; it will automatically load matching
%     datasets, plot them, and format the figure.
%
%  License Summary:
%  Permission is hereby granted, free of charge, to any person obtaining
%  a copy of this software and associated documentation files (the
%  "Software"), to deal in the Software without restriction, including
%  without limitation the rights to use, copy, modify, merge, publish,
%  distribute, sublicense, and/or sell copies of the Software, and to
%  permit persons to whom the Software is furnished to do so, subject to
%  the following conditions:
%
%  The above copyright notice and this permission notice shall be included
%  in all copies or substantial portions of the Software.
%
%  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
%  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
%  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
%  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
%  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
%  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
%  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
%% ===============================================================
close all
clear all
clc

folders = {
    './../gpgs/nucleon-nucleon/proton-nucleon/', ... % path to the dataset, one can download it from https://github.com/Lei-Cong/Spin-Dependent-5th-Force-Limits/tree/aaf90f65d851886ede5f4701aa2f9139f4b1b270/Dataset/normalized
    './Your-new-data/'  % In case one want to load their own data for comparision, here is the path to their own data folder
};

% Indicate which data you want to add for comparision
nameHints = {
    %'910Venema_1992_m_abs_NN', % Name of the data from the dataset you want to show
    %'910Zhang_2023_m_abs_nN',
    '910Safronova_2018_Kimball_m_abs_pN',
    '910Safronova_2018_Youdin_m_abs_pN',
    '910Lee_2018_2_m_abs_pN',
    %'45Ficek_2017_V4+5_m_abs_ee',
    'New_constriants_nN', % Name of the data from your own folder 
    %'New_constriants_pN',
};

% Set a name fo the variance used to save the constraints data
varNames = {
    %'V910_Venema_1992', 
    %'V910_Zhang_2023',
    'V910_Jacson_Kimball_2017',
    'V910_Youdin_1996',
    'V910_Lee_2018',
    %'V3Ficek_2017',
    %'V45Ficek_2017',
    'V910_New_constriants',
    %'V910_New_constriants_2',
};


assign_multiple_data_by_name_multi(folders, nameHints, varNames);

% Some extra changes
V910_New_constriants(:,2)=V910_New_constriants(:,2)/2*0.8;

%% Set axis: the senctence below is used to set the x axis on the top and bottom of the picture
ax = axes();
hold(ax);
ax.XAxis.Scale = 'log';
ax.YAxis.Scale = 'log';
RSfigureset;
ssize=14;
xlabel(ax, '\lambda (m)', 'Interpreter', 'tex', 'FontSize', ssize);
ylabel(ax, '|g_p^pg_s^N|', 'Interpreter', 'tex', 'FontSize', ssize);

fig=figure(1)
% setup top axis
ax_top = axes(); % axis to appear at top
hold(ax_top);
ax_top.XAxis.Scale = 'log';
ax_top.YAxis.Scale = 'log';
RSfigureset;
ax_top.XAxisLocation = 'top';
ax_top.YAxisLocation = "right";
%ax_top.YTick = [];
ax_top.XDir = 'reverse';
ax_top.Color = 'none';
xlabel(ax_top, 'Mass (eV)', 'Interpreter', 'tex', 'FontSize', ssize);
% 
% linking axis
linkprop([ax, ax_top],{'Units','Position','ActivePositionProperty'});
ax.Position(4) = ax.Position(4) * 0.96;

h = 4.135e-15/2/pi; %eV s
c = 3e8; %m/s
lambda = logspace(-6,14,5); %m
E = h*c./(lambda); % 10^6 because lambda is in microns

% configure limits of bottom axis
ax.XLim = [1e-4 1e12];
ax.YLim = [1e-32 1e-20];
ax.XTick = lambda;
% configure limits and labels of top axis
ax_top.XLim = fliplr(h*c./(ax.XLim));
ax_top.YLim = ax.YLim;

%% Add constriants lines
% fill in the excluded area with gray
% V2

[fill_x, fill_y]=minCurve_log(V910_Youdin_1996,V910_Lee_2018,V910_Jacson_Kimball_2017); % write which curve you want to be above, one can use a few lines together [fill_x, fill_y]=minCurve_log(V3Ficek_2017,V2Jiao_2019,V2Kotler_2015);
ar3 = area(ax, fill_x, fill_y, 1, ...
    'FaceAlpha', 0.25, ...
    'EdgeAlpha', 0, ...
    'FaceColor', [0.2 0.2 0.2], ...
    'DisplayName', 'Exclusion Region');

% Color for lines
colors=linspecer(numel(varNames))

% Linetype
lineStyles = {'-', '-', '-', '-.'};

for i = 1:length(varNames)
    data = evalin('base', varNames{i});  % 从 base 取变量
    % 循环颜色和线型（取模保证超过列表长度时能重复）
    colorIdx = mod(i-1, size(colors,1)) + 1;
    styleIdx = mod(i-1, length(lineStyles)) + 1;
    
    loglog(ax, data(:,1), data(:,2), ...
    'Color', colors(colorIdx,:), ...   % ✅ 属性名和属性值用逗号隔开
    'LineStyle', lineStyles{styleIdx});
end
lgd = legend(ax, 'Previous exclusion region', 'V_{9+10}, Jacson Kimball 2017','V_{9+10}, Youdin 1996','V_{9+10}, Lee 2018', 'Our Projection', 'Location', 'northeast');
lgd.Box = 'off';


%% set the figure size
uistack(ax,'top')   
RSfigureset
uistack(ax,'bottom') 
RSfigureset

set(ax_top,'yticklabel',{[]})

% change axes position
set (gca,'position',[0.15,0.12,0.82,0.75] );%top figure set axis distance to bound, left bound, right bound, height, width

% second time change window size
set(gcf,'WindowStyle','normal');
set(gcf,'Position',[100,262,450,350]);

text(ax,5e-4,1e-22,'(a)','FontSize',16,'FontName','Serif');


  
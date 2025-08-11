function fill_between_loglog(ax, x1, y1, x2, y2, faceColor, faceAlpha, xrange)

    % 在 log-log 坐标下填充两条曲线之间的区域
    % ax: 坐标轴句柄
    % xrange: [xmin xmax] 只填充这个范围内的区域（可选）
    
    if nargin < 6, faceColor = [0.6 0.8 0.2]; end  % 默认苹果绿
    if nargin < 7, faceAlpha = 0.35; end
    if nargin < 8, xrange = [min([x1(:); x2(:)]), max([x1(:); x2(:)])]; end

    % 转列向量
    x1 = x1(:); y1 = y1(:);
    x2 = x2(:); y2 = y2(:);

    % 在 log 空间求公共 x 范围
    lx1 = log10(x1); lx2 = log10(x2);
    lx_min_data = max(min(lx1), min(lx2));
    lx_max_data = min(max(lx1), max(lx2));

    % 将用户指定范围也考虑进来
    lx_min = max(lx_min_data, log10(xrange(1)));
    lx_max = min(lx_max_data, log10(xrange(2)));

    if lx_min >= lx_max
        error('两条曲线在给定范围内没有重叠区域');
    end

    % 公共网格
    lgx = linspace(lx_min, lx_max, 500);
    x_common = 10.^lgx;

    % 在 log 空间插值
    ly1i = interp1(lx1, log10(y1), lgx, 'linear');
    ly2i = interp1(lx2, log10(y2), lgx, 'linear');
    y1i = 10.^ly1i;
    y2i = 10.^ly2i;

    % 构造多边形
    Xpoly = [x_common, fliplr(x_common)];
    Ypoly = [y1i, fliplr(y2i)];

    % 绘制
    hold(ax, 'on');
    fill(ax, Xpoly, Ypoly, faceColor, 'FaceAlpha', faceAlpha, 'EdgeColor', 'none','DisplayName', 'New Boson Region');
    set(ax, 'XScale', 'log', 'YScale', 'log');
end

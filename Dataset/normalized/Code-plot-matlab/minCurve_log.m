function [minX, minY] = minCurve(varargin)

    % Get total number of datasets
    nDatasets = length(varargin);

    % Initialize a cell array to hold interpolated curves
    interpCurves = cell(nDatasets, 1);

    % Initialize arrays to hold the minimum and maximum x-values for each dataset
    minVals = zeros(nDatasets, 1);
    maxVals = zeros(nDatasets, 1);

    % Loop over all datasets to find their respective min and max x-values
    for i = 1:nDatasets
        data = varargin{i};
        minVals(i) = min(data(:, 1));
        maxVals(i) = max(data(:, 1));
    end

    % Find the overall minimum and maximum x-values across all datasets
    minXVal = min(minVals);
    maxXVal = max(maxVals);

    % Define a common x-vector for interpolation (in log space)
    xVector = logspace(log10(minXVal), log10(maxXVal), 10000);

    % Loop over all datasets
    for i = 1:nDatasets
        % Get the current dataset
        data = varargin{i};
        % Sort the dataset by the x-values
        data = sortrows(data);
        % Define the x-vector for this dataset, limited to its original x-range
        xVec = xVector(xVector >= minVals(i) & xVector <= maxVals(i));
        
        % Get unique values in the data
[data_unique, ia] = unique(data(:, 1));
% Interpolate the curve to the common x-vector in log space
interpCurve = interp1(log10(data_unique), log10(data(ia, 2)), log10(xVec), 'linear', NaN);

        % Interpolate the curve to the common x-vector in log space
        %interpCurve = interp1(log10(data(:, 1)), log10(data(:, 2)), log10(xVec), 'linear', NaN);
        % Extend the interpolated curve to the overall x-range, filling with NaNs
        interpCurves{i} = [NaN(1, sum(xVector < minVals(i))), interpCurve, NaN(1, sum(xVector > maxVals(i)))];
    end

    % Convert the cell array to a matrix
    interpCurves = cell2mat(interpCurves);

    % Find the minimum y-value at each x-location (in log space, then convert back)
    minY = 10 .^ min(interpCurves, [], 1);

    % Remove locations where all interpolated curves are NaN
    validLocations = ~all(isnan(interpCurves), 1);
    minX = xVector(validLocations);
    minY = minY(validLocations);
end

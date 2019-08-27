#!/usr/bin/env python3
import copy

import numpy as np


def avail_mono(input_arrs, times, thresh, strict=True):
    """
    calculates slope of each sample wrt last last sample
    if slope is greater than threshold, the sample is marked as available
    returns % available samples for a time series
    also returns % stats available
    input_arrs: [values, is_valid]
    output: [availability stats_availability]
    if stats availability is 80%, output can take either side for remaining 20%
    """
    is_valid = input_arrs[1]
    values = input_arrs[0][is_valid]
    times = times[is_valid]
    if is_valid.sum() <= 1:
        return [0.0, 0.0]
    diff_values = np.convolve(values, [1, -1], "valid")
    diff_times = np.convolve(times, [1, -1], "valid")
    slopes = diff_values / diff_times
    if strict:
        good_slopes = slopes > thresh
    else:
        good_slopes = slopes >= thresh
    availability = 100.0 * diff_times[good_slopes].sum() / diff_times.sum()
    stats_availability = 100.0 * is_valid.sum() / len(is_valid)
    return [availability, stats_availability]


def data_avail(input_arrs, data_threshold, per_threshold, times):
    """
    input_arrs: [ok, fail, ok_valid, fail_valid]
    output: [link_av, data_av, stat_av]
    """
    # availability of stats
    ok_valid = input_arrs[2]
    fail_valid = input_arrs[3]
    stat_av_arr = np.logical_and(ok_valid, fail_valid)
    stat_av = 100.0 * stat_av_arr.sum() / len(stat_av_arr)
    if stat_av_arr.sum() <= 1:
        return [0.0, 0.0, 0.0]
    # availability of data flow through link
    ok = input_arrs[0][stat_av_arr]
    fail = input_arrs[1][stat_av_arr]
    times = times[stat_av_arr]
    all_data = ok + fail
    diff_all_data = np.convolve(all_data, [1, -1], "valid")
    diff_fail = np.convolve(fail, [1, -1], "valid")
    diff_times = np.convolve(times, [1, -1], "valid")
    data_av_arr = diff_all_data / diff_times >= data_threshold
    data_av = 100.0 * data_av_arr.sum() / len(data_av_arr)
    if data_av == 0:
        return [0.0, 0.0, stat_av]
    # useful-ness of link
    link_av_arr = (
        100.0 * diff_fail[data_av_arr] / diff_all_data[data_av_arr]
    ) <= per_threshold
    link_av = 100.0 * link_av_arr.sum() / len(link_av_arr)
    return [link_av, data_av, stat_av]


def stats_src_to_link_dir(result):
    """
    for DN <--> CN link
    txOk is generated by both DN and CN
    txOk can be indexed by the src the stat is coming from (DN or CN)
    Or it can be indexed by the link direction stats (DN-->CN or CN-->DN)
    for txOk both indexes are same but for rxOk the indexes are reversed
    this helper function would swap the index if needed
    """
    result_copy = copy.deepcopy(result)
    for ind, val in enumerate(result):
        result_copy[ind][:, 0], result_copy[ind][:, 1] = val[:, 1], val[:, 0]
    return result_copy


def process_histogram(data, histogram_axis, bins, pcentile_thresh, reverse):
    """
    Converts histogram data to average, standard deviation, percentile value
    Set reverse = True, if better values take higher indices
    """
    bins = np.array(bins)
    # generated probability or normalized histogram
    count = data.sum(axis=histogram_axis)
    count_idx = [slice(None)] * len(data.shape)
    count_idx[histogram_axis] = np.newaxis
    prob = data / count[count_idx]
    # generate average and standard deviation
    bin_idx = [np.newaxis] * len(data.shape)
    bin_idx[histogram_axis] = slice(None)
    average = (bins[bin_idx] * prob).sum(axis=histogram_axis)
    std_dev = np.sqrt(
        (((bins[bin_idx] - average[count_idx]) ** 2) * prob).sum(axis=histogram_axis)
    )
    # generate percentile value
    if reverse:
        prob = np.flip(prob, histogram_axis)
    df = np.cumsum(prob, histogram_axis)
    hist_idx = [slice(None)] * len(data.shape)
    hist_idx[histogram_axis] = slice(0, len(bins))
    delta = np.apply_along_axis(
        np.convolve, histogram_axis, df >= pcentile_thresh, [1, -1]
    )[hist_idx]
    if reverse:
        delta = np.flip(delta, histogram_axis)
    pcentile_value = (delta * bins[bin_idx]).sum(axis=histogram_axis)
    return average, std_dev, pcentile_value


def int_histogram(data, validity, axis, decimal=0):
    """
    Replace axis with histogram
    """
    data = np.around(data, decimal).astype(int)
    data_min = np.min(data[validity])
    data_max = np.max(data[validity])
    data[np.logical_not(validity)] = data_max + 1
    data -= data_min
    bins = range(data_min, data_max + 1)
    idx = [slice(None)] * len(data.shape)
    idx[axis] = slice(0, len(bins))
    result = np.apply_along_axis(np.bincount, axis, data, minlength=len(bins) + 1)[
        idx
    ].astype(float)
    validity = 100 * validity.sum(axis=axis) / validity.shape[axis]
    return result, bins, validity

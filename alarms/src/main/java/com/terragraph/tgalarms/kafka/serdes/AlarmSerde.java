/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.terragraph.tgalarms.kafka.serdes;

import java.util.Map;

import org.apache.kafka.common.serialization.Deserializer;
import org.apache.kafka.common.serialization.Serde;
import org.apache.kafka.common.serialization.Serializer;

import com.terragraph.tgalarms.models.Alarm;

/**
 * Alarm serializer/deserializer.
 */
public class AlarmSerde implements Serde<Alarm> {
	@Override
	public void configure(Map<String, ?> configs, boolean isKey) {}

	@Override
	public Serializer<Alarm> serializer() {
		return new JsonSerializer<Alarm>();
	}

	@Override
	public Deserializer<Alarm> deserializer() {
		return new JsonDeserializer<Alarm>(Alarm.class);
	}

	@Override
	public void close() {}
}

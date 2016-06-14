/* global Module */

/* Magic Mirror
 * Module: ThingSpeak
 * 
 * By Teemu M
 * Based on the currentweather module by Michael Teeuw http://michaelteeuw.nl
 */

Module.register("thingspeak",{

	// Default module config.
	defaults: {
		api_key: "",
		ch_id: "",
		field_id: "",
		prefix: "prefix",
		suffix: "suffix", //"&deg;",
		units: config.units,
		updateInterval: 10 * 60 * 1000, // every 10 minutes
		animationSpeed: 1000,
		lang: config.language,

		initialLoadDelay: 0, // 0 seconds delay
		retryDelay: 2500,
	},

	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);

		this.temperature = null;

		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		this.updateTimer = null;

	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.config.ch_id === "") {
			wrapper.innerHTML = "Please set the correct ThingSpeak <i>channel id</i> in the config for module: " + this.name + ".";
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		if (!this.loaded) {
			wrapper.innerHTML = 'LOADING ' + this.name;
			wrapper.className = "dimmed light small";
			return wrapper;
		}

		var large = document.createElement("div");
		large.className = "large light";

		var temperature = document.createElement("span");
		temperature.className = "bright";
		temperature.innerHTML = this.config.prefix + this.temperature + this.config.suffix;
		large.appendChild(temperature);

		wrapper.appendChild(large);
		return wrapper;
	},

	/* updateDatapoint(compliments)
	 * Requests new data from thingspeak.com.
	 */
	updateDatapoint: function() {
		var url = "https://api.thingspeak.com/channels/" + this.config.ch_id + "/fields/" + this.config.field_id + "/last.txt?api_key=" + this.config.api_key;
		var self = this;
		var retry = true;

		var dataPointRequest = new XMLHttpRequest();
		dataPointRequest.open("GET", url, true);
		dataPointRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processTemperature(this.response)
					//self.temperature = this.response;
					//self.loaded = true;
					//self.updateDom(this.config.animationSpeed)
				} else if (this.status === 400) {
					self.config.api_key = "";
					self.updateDom(self.config.animationSpeed);

					Log.error(self.name + ": Incorrect API KEY.");
					retry = false;
				} else {
					Log.error(self.name + ": Could not load datapoint.");
				}

				if (retry) {
					self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
				}
			}
		};
		dataPointRequest.send();
	},

	processTemperature: function(data) {
		this.temperature = parseFloat(data).toFixed(0);
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
	 */
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.updateDatapoint();
		}, nextLoad);
	},

});

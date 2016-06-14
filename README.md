# MM-thingspeak-module
Example configuration:
>			module: 'thingspeak',
>			position: 'middle_center',
>			config: {
>				api_key: 'ABCDEFGHIJ', // READ API key required for private channels
>				ch_id: '1234567890', // Required for the module to work
>				field_id: '123',
>				prefix: 'Temperature: ',
>				suffix: ' degrees',
>				updateInterval: 10 * 60 * 1000 // Update interval in milliseconds
>			}

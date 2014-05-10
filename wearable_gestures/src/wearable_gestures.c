#include <pebble.h>

// define globals required for displaying text data on watch face
Window *window;
TextLayer *text_date_layer;
TextLayer *text_status_layer;
TextLayer *text_time_layer;
Layer *line_layer;

// updating the line layer on the watch face
void line_layer_update_callback(Layer *layer, GContext* ctx) {
	graphics_context_set_fill_color(ctx, GColorWhite);
	graphics_fill_rect(ctx, layer_get_bounds(layer), 0, GCornerNone);
}

/* tap text which is used to store information about the direction of the accel
   tap event that is detected */
char tap_text[3];

// initial watch face text
static char init_text[] = "Ready to Shake!";

// handler for the changing of the time
void handle_minute_tick(struct tm *tick_time, TimeUnits units_changed) {
	// Need to be static because they're used by the system later.
	static char time_text[] = "00:00";
	static char date_text[] = "Xxxxxxxxx 00";
	char *time_format;
	if (!tick_time) {
		time_t now = time(NULL);
		tick_time = localtime(&now);
	}
	strftime(date_text, sizeof(date_text), "%B %e", tick_time);
	text_layer_set_text(text_date_layer, date_text);
	// clock style format
	if (clock_is_24h_style()) {
		time_format = "%R";
	} else {
		time_format = "%I:%M";
	}
	// convert to string
	strftime(time_text, sizeof(time_text), time_format, tick_time);
	// Kludge to handle lack of non-padded hour format string
	// for twelve hour clock.
	if (!clock_is_24h_style() && (time_text[0] == '0')) {
		memmove(time_text, &time_text[1], sizeof(time_text) - 1);
	}
	// set the text layer for the time
	text_layer_set_text(text_time_layer, time_text);
}

// all the different handlers for the app message communication system
// between the pebble and the phone app
void out_sent_handler(DictionaryIterator *sent, void *context) {
	// outgoing message was delivered
	return;
}
void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
	// outgoing message failed
	return;
}
void in_received_handler(DictionaryIterator *received, void *context) {
	// incoming message received
	// create a tuple lookup in our dictionary
	// 1 signifies that the server is busy trying to match the signal
	// 2 signifies that the server has finished the matching attempt and
	// the watch app is ready to start shaking again.
	Tuple *key_tuple1 = dict_find(received, 1);
	if (key_tuple1) {
		// update the text layer to notify the user what is going on
		static char recording_text[] = "Server matching...";
		text_layer_set_text(text_status_layer, recording_text);
		// unsubscribe from the accelerometer data service, since we no longer need
		// accelerometer data whilst the server is performing the match on the previous
		// collected info
		accel_data_service_unsubscribe();
		return;
	}
	// reset to ready to shake
	Tuple *key_tuple2 = dict_find(received, 2);
	if (key_tuple2) {
		static char reinit_text[] =  "Ready to Shake!";
		text_layer_set_text(text_status_layer, reinit_text);
	}
	return;
}
void in_dropped_handler(AppMessageResult reason, void *context) {
	// incoming message dropped
	return;
}

// init function
static void init(void) {
	// register all of our handlers defined above
	app_message_register_inbox_received(in_received_handler);
	app_message_register_inbox_dropped(in_dropped_handler);
	app_message_register_outbox_sent(out_sent_handler);
	app_message_register_outbox_failed(out_failed_handler);
	// set the inbound and outbound message size
	const uint32_t inbound_size = 64;
	const uint32_t outbound_size = 512;
	// open communication for these sizes
	app_message_open(inbound_size, outbound_size);
	// full screen watchface (does not contain the time on top status bar)
	window_set_fullscreen(window, true);
	// push to top of stack
	window_stack_push(window, true 
	/* Animated */
	);
	// color the background black
	window_set_background_color(window, GColorBlack);
	// get root layer of the window layer
	Layer *window_layer = window_get_root_layer(window);
	// create all the text layers and set their color and properties
	/* Server matching status layer */
	text_status_layer = text_layer_create(GRect(8, 15, 144-8, 168-15));
	text_layer_set_text_color(text_status_layer, GColorWhite);
	text_layer_set_background_color(text_status_layer, GColorClear);
	text_layer_set_font(text_status_layer, fonts_get_system_font(FONT_KEY_ROBOTO_CONDENSED_21));
	layer_add_child(window_layer, text_layer_get_layer(text_status_layer));
	text_layer_set_text(text_status_layer, init_text);
	/* Date info */
	text_date_layer = text_layer_create(GRect(8, 68, 144-8, 168-68));
	text_layer_set_text_color(text_date_layer, GColorWhite);
	text_layer_set_background_color(text_date_layer, GColorClear);
	text_layer_set_font(text_date_layer, fonts_get_system_font(FONT_KEY_ROBOTO_CONDENSED_21));
	layer_add_child(window_layer, text_layer_get_layer(text_date_layer));
	/* Time info */
	text_time_layer = text_layer_create(GRect(7, 92, 144-7, 168-92));
	text_layer_set_text_color(text_time_layer, GColorWhite);
	text_layer_set_background_color(text_time_layer, GColorClear);
	text_layer_set_font(text_time_layer, fonts_get_system_font(FONT_KEY_ROBOTO_BOLD_SUBSET_49));
	layer_add_child(window_layer, text_layer_get_layer(text_time_layer));
	/* Line to separate sections */
	GRect line_frame = GRect(8, 97, 139, 2);
	line_layer = layer_create(line_frame);
	layer_set_update_proc(line_layer, line_layer_update_callback);
	layer_add_child(window_layer, line_layer);
	/* subscribe to time event handlers */
	tick_timer_service_subscribe(MINUTE_UNIT, handle_minute_tick);
	handle_minute_tick(NULL, MINUTE_UNIT);
}

// accelerometer handler
void accel_handler(AccelData *data, uint32_t num_samples) {
	// create the dictionary
	DictionaryIterator *iter;
	// begin the outbox for sending the data via app message
	app_message_outbox_begin(&iter);
	// for the 25 collected samples
	for (int i = 0;i<25;i++) {
		// allocate memory for each reading that will go into our dict
		char* str = malloc(8*sizeof(char));
		// copy accelerometer data (y direction only) into this char*
		snprintf(str, 8,"%d",data[i].y);
		//"%d,%d,%d", data[i].x, data[i].y, data[i].z);
		// build a tuple with this str and a key (based on i)
		Tuplet tuplex = TupletCString(i+1, str);
		// write tuple to the dict
		dict_write_tuplet(iter, &tuplex);
		// free the malloc'd memory
		free(str);
	}
	// end the dict
	dict_write_end(iter);
	// send the dict in the outbox to the phone
	app_message_outbox_send();
};

/* this is the event handler for tap events that gets activated on detection
   of sharp movement in any axis direction - we use this to detect handshake motion
   in the y axis accelerometer direction */
void tap_handler(AccelAxisType axis, int32_t direction) {
	// Build a short message one character at a time to cover all possible taps.
	if (direction > 0) {
		tap_text[0] = '+';
	} else {
		tap_text[0] = '-';
	}
	if (axis == ACCEL_AXIS_X) {
		tap_text[1] = 'X';
		// we dont care about x-axis tap events
	} else if (axis == ACCEL_AXIS_Y) {
		tap_text[1] = 'Y';
		// handle the y tap that may be a handshake
		// change screen status text to recording
		static char recording_text[] = "Recording the Shakes...";
		text_layer_set_text(text_status_layer, recording_text);
		// subscribe to accelerometer service to start sampling the data from the handshake	 
		// buffering 25 samples before the handler is called
		accel_data_service_subscribe(25, accel_handler);
		// set the sampling rate to 50hz
		accel_service_set_sampling_rate(ACCEL_SAMPLING_50HZ);
	} else if (axis == ACCEL_AXIS_Z) {
		tap_text[1] = 'Z';
		// we dont care about the z-axis tap events
	}
	// The last byte must be zero to indicate end of string.
	tap_text[2] = 0;
}
// on window load
void window_load(Window *window) {
	// subscribe to the accelerometer tap service event
	// and specify the tap handler to be called on occurence of tap event
	accel_tap_service_subscribe(tap_handler);
}
// clean up
void window_unload(Window *window) {
	// unsubscribe from existing services
	tick_timer_service_unsubscribe();
	accel_tap_service_unsubscribe();
}
// main function
int main() {
	// create window space on the heap
	window = window_create();
	// set handlers for load and unload of window
	window_set_window_handlers(window, (WindowHandlers) {
		.load = window_load,
		    .unload = window_unload,
	}
	);
	// call initializing function
	init();
	// the event loop for the app - will block until the app is ready to exit
	app_event_loop();
	// destroy previously created window
	window_destroy(window);
}

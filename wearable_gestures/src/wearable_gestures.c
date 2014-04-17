#include <pebble.h>

Window *window;
TextLayer *text_date_layer;
TextLayer *text_status_layer;
TextLayer *text_time_layer;
Layer *line_layer;

void line_layer_update_callback(Layer *layer, GContext* ctx) {
  graphics_context_set_fill_color(ctx, GColorWhite);
  graphics_fill_rect(ctx, layer_get_bounds(layer), 0, GCornerNone);
}
char tap_text[3];
 static char init_text[] = "Ready to Shake!";
void handle_minute_tick(struct tm *tick_time, TimeUnits units_changed) {
  // Need to be static because they're used by the system later.
  static char time_text[] = "00:00";
  static char date_text[] = "Xxxxxxxxx 00";

  char *time_format;

  if (!tick_time) {
    time_t now = time(NULL);
    tick_time = localtime(&now);
  }

  // TODO: Only update the date when it's changed.
  strftime(date_text, sizeof(date_text), "%B %e", tick_time);
  text_layer_set_text(text_date_layer, date_text);


  if (clock_is_24h_style()) {
    time_format = "%R";
  } else {
    time_format = "%I:%M";
  }

  strftime(time_text, sizeof(time_text), time_format, tick_time);

  // Kludge to handle lack of non-padded hour format string
  // for twelve hour clock.
  if (!clock_is_24h_style() && (time_text[0] == '0')) {
    memmove(time_text, &time_text[1], sizeof(time_text) - 1);
  }

  text_layer_set_text(text_time_layer, time_text);
}


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
	Tuple *key_tuple1 = dict_find(received, 1);
	if (key_tuple1) {
	static char recording_text[] = "Server matching...";
  	text_layer_set_text(text_status_layer, recording_text);
	accel_data_service_unsubscribe();
	return;	
	}

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

static void init(void) {
   app_message_register_inbox_received(in_received_handler);
   app_message_register_inbox_dropped(in_dropped_handler);
   app_message_register_outbox_sent(out_sent_handler);
   app_message_register_outbox_failed(out_failed_handler);


   const uint32_t inbound_size = 64;
   const uint32_t outbound_size = 512;
   app_message_open(inbound_size, outbound_size);


  window_set_fullscreen(window, true);
  window_stack_push(window, true /* Animated */);
  window_set_background_color(window, GColorBlack);
Layer *window_layer = window_get_root_layer(window);
 text_status_layer = text_layer_create(GRect(8, 15, 144-8, 168-15));
  text_layer_set_text_color(text_status_layer, GColorWhite);
  text_layer_set_background_color(text_status_layer, GColorClear);
  text_layer_set_font(text_status_layer, fonts_get_system_font(FONT_KEY_ROBOTO_CONDENSED_21));
  layer_add_child(window_layer, text_layer_get_layer(text_status_layer));
  text_layer_set_text(text_status_layer, init_text);




  text_date_layer = text_layer_create(GRect(8, 68, 144-8, 168-68));
  text_layer_set_text_color(text_date_layer, GColorWhite);
  text_layer_set_background_color(text_date_layer, GColorClear);
  text_layer_set_font(text_date_layer, fonts_get_system_font(FONT_KEY_ROBOTO_CONDENSED_21));
  layer_add_child(window_layer, text_layer_get_layer(text_date_layer));


  text_time_layer = text_layer_create(GRect(7, 92, 144-7, 168-92));
  text_layer_set_text_color(text_time_layer, GColorWhite);
  text_layer_set_background_color(text_time_layer, GColorClear);
  text_layer_set_font(text_time_layer, fonts_get_system_font(FONT_KEY_ROBOTO_BOLD_SUBSET_49));
  layer_add_child(window_layer, text_layer_get_layer(text_time_layer));

  GRect line_frame = GRect(8, 97, 139, 2);
  line_layer = layer_create(line_frame);
  layer_set_update_proc(line_layer, line_layer_update_callback);
  layer_add_child(window_layer, line_layer);

  tick_timer_service_subscribe(MINUTE_UNIT, handle_minute_tick);
  handle_minute_tick(NULL, MINUTE_UNIT);


 }
void accel_handler(AccelData *data, uint32_t num_samples)
{

DictionaryIterator *iter;
app_message_outbox_begin(&iter);
for (int i = 0;i<25;i++)
{
  char* str = malloc(8*sizeof(char));
snprintf(str, 8,"%d",data[i].y);//"%d,%d,%d", data[i].x, data[i].y, data[i].z);
	
  Tuplet tuplex = TupletCString(i+1, str);
  dict_write_tuplet(iter, &tuplex);
  free(str);
}

dict_write_end(iter);
app_message_outbox_send();
//accel_data_service_unsubscribe();
};
 
void tap_handler(AccelAxisType axis, int32_t direction)
{
  // Build a short message one character at a time to cover all possible taps.
 
  if (direction > 0)
  {
    tap_text[0] = '+';
  } else {
    tap_text[0] = '-';
  }
 
  if (axis == ACCEL_AXIS_X)
  {
    tap_text[1] = 'X';
  } else if (axis == ACCEL_AXIS_Y)
  {
	 
  accel_data_service_subscribe(25, accel_handler);
  accel_service_set_sampling_rate(ACCEL_SAMPLING_10HZ);
  static char recording_text[] = "Recording the Shakes...";
  text_layer_set_text(text_status_layer, recording_text);
    tap_text[1] = 'Y';
  } else if (axis == ACCEL_AXIS_Z)
  {
    tap_text[1] = 'Z';
  }
 
  // The last byte must be zero to indicate end of string.
  tap_text[2] = 0;

}
 
void window_load(Window *window)
{
  
  accel_tap_service_subscribe(tap_handler);
}
 
void window_unload(Window *window)
{
  tick_timer_service_unsubscribe();
  accel_tap_service_unsubscribe();
}
 
int main()
{
	
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers)
  {
    .load = window_load,
    .unload = window_unload,
  }); 
 
init();
 app_event_loop();
  window_destroy(window);
}

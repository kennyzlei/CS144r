#include <pebble.h>
 
Window *window;
TextLayer *text_layer_1, *text_layer_2;
char tap_text[3];
 



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

 }
void accel_handler(AccelData *data, uint32_t num_samples)
{

DictionaryIterator *iter;
app_message_outbox_begin(&iter);
for (int i = 0;i<25;i++)
{
  char* str = malloc(50*sizeof(char));
  snprintf(str, 50, "x: %d, y: %d, z: %d, time %d", data[i].x, data[i].y, data[i].z, (int)data[i].timestamp);
	//Tuplet tuplex = TupletInteger(i, data[i].x);
  char* string = "Blah";
  Tuplet tuplex = TupletCString(i+1, str);
  dict_write_tuplet(iter, &tuplex);
  free(str);
}

dict_write_end(iter);
app_message_outbox_send();
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
    tap_text[1] = 'Y';
  } else if (axis == ACCEL_AXIS_Z)
  {
    tap_text[1] = 'Z';
  }
 
  // The last byte must be zero to indicate end of string.
  tap_text[2] = 0;
 
  text_layer_set_text(text_layer_2, tap_text);
}
 
void window_load(Window *window)
{
  Layer *window_layer = window_get_root_layer(window);
 
  text_layer_1 = text_layer_create(GRect(0, 0, 144, 20));
  layer_add_child(window_layer, text_layer_get_layer(text_layer_1));
 
  text_layer_2 = text_layer_create(GRect(0, 20, 144, 20));
  layer_add_child(window_layer, text_layer_get_layer(text_layer_2));
 
  accel_data_service_subscribe(25, accel_handler);
  accel_service_set_sampling_rate(ACCEL_SAMPLING_100HZ);
 
  accel_tap_service_subscribe(tap_handler);
}
 
void window_unload(Window *window)
{
  // Call this before destroying text_layer, because it can change the text
  // and this must only happen while the layer exists.
  accel_data_service_unsubscribe();
  accel_tap_service_unsubscribe();
 
  text_layer_destroy(text_layer_2);
  text_layer_destroy(text_layer_1);
}
 
int main()
{
	init();
  window = window_create();
  window_set_window_handlers(window, (WindowHandlers)
  {
    .load = window_load,
    .unload = window_unload,
  });
  window_stack_push(window, true);
  app_event_loop();
  window_destroy(window);
}

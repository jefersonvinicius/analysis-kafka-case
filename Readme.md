Create events processor with 2 endpoints.
One handle synchronously, saving each event direct into database
The another one is async, which save up to 20 events in redis before send to kafka queue to be processed and saved into database
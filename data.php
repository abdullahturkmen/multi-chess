<?php

require __DIR__ . '/vendor/autoload.php';


use ElephantIO\Client;
use ElephantIO\Engine\SocketIO\Version2X;


$client = new Client(new Version2X('http://localhost:3000'));

$client->initialize();
$client->emit('userlogin', ['name'=>'adımsoyadım3']);

$client->close();

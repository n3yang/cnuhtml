<?php


$base_uri = 'http://115.47.56.228:8080/alumni/service';
// $_POST['type'] = 1;
// $_POST['page']=1;
// $_POST['num']=1;
// $_POST['previewLen']=100;
// $_POST['sid'] = 'bb3676615e121d64628926de85bc544637cd46e7c7a095978dba7e45134327d487487d1f9b65940d';

if ($_GET['pa'] == '/login') {

	$request_uri = $base_uri . $_GET['pa'] . '?v=1&cid=1';
	$data = file_get_contents('php://input');
	$option = array(
		CURLOPT_URL				=> $request_uri,
		CURLOPT_RETURNTRANSFER	=> 1,
		CURLOPT_POST			=> 1,
		CURLOPT_POSTFIELDS		=> $data,
		CURLOPT_TIMEOUT			=> 5, // timeout: 5 seconds
		CURLOPT_HTTPHEADER		=> array('Content-Type: application/json','Content-Length: '.strlen($data)),
	);
	$ch = curl_init();
	curl_setopt_array($ch, $option);
	$rs = curl_exec($ch);
	echo $rs;
} else {
	$request_uri = $base_uri . $_GET['pa'];
	foreach ($_GET as $key => $value) {
		if ($key=='pa') {
			continue;
		}
		$r.= '&' . $key . '=' . $value;
	}
	$request_uri.=$r;
	echo file_get_contents($request_uri);
}
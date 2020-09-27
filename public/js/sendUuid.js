function sendUuid(event, uuid, endpoint)
{
	console.log(`Sending UUID ${uuid}.`);
	event.preventDefault();

	const req = {
		uuid: uuid
	};

	$.ajax({
		url: `${endpoint}`,
		type: "post",
		data: JSON.stringify(req),
		dataType: "json",
		contentType: "application/json",
		success: function (res) {
			console.log("UUID successfully sent:");
			console.log(res.toString());
			location.search = "";
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
			location.search = "";
		}
	});
}
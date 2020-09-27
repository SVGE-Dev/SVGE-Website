function sendForm(event, form, endpoint)
{
	console.log(`Updating user with endpoint ${endpoint}.`);
	event.preventDefault();

	const formData = new FormData(form);
	for (const d of formData) {
		console.log(d);
	}

	$.ajax({
		url: `${endpoint}`,
		type: "post",
		data: formData,
		// https://stackoverflow.com/questions/11071100/jquery-uncaught-typeerror-illegal-invocation-at-ajax-request-several-eleme
		processData: false,
		enctype: "multipart/form-data",
		contentType: false,
		success: function (res) {
			console.log("Form successfully sent:");
			console.log(res.toString());
			location.search = "";
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
			//location.search = "";
		}
	});
}
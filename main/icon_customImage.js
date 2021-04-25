ymaps.ready(function () {
    var myMap = new ymaps.Map('map', {
            center: [59.938, 30.3141],
            zoom: 9
        }, {
            searchControlProvider: 'yandex#search'
        }),

        // Создаём макет содержимого.
        MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div style="color: #FFFFFF; font-weight: bold;">$[properties.iconContent]</div>'
        );
	
		async function getData(url = '../loadpoints?x=0&y=0&radius=1000') {
			const response = await fetch(url);
			return await response.json(); // parses JSON response into native JavaScript objects
		}
	
	getData().then(data=>{ 
		data.forEach((elem)=>{
			var mark = new ymaps.Placemark([elem['x_pos'],elem['y_pos']]);
			mark.events.add('click', function () {
												doc = document.getElementById('description_adress');
												doc.innerHTML = elem['description'];
											});
                                        

			myMap.geoObjects.add(mark);
		});
	});



});
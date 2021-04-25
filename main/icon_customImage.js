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
			myMap.geoObjects.add(new ymaps.Placemark([elem['x_pos'],elem['y_pos']]))
			});
	});
	

    myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
        hintContent: 'Собственный значок метки',
        balloonContent: 'Это красивая метка'
    }, {
        // Опции.
        // Необходимо указать данный тип макета.
        iconLayout: 'default#image',
        // Своё изображение иконки метки.
        iconImageHref: 'images/myIcon.gif',
        // Размеры метки.
        iconImageSize: [30, 42],
        // Смещение левого верхнего угла иконки относительно
        // её "ножки" (точки привязки).
        iconImageOffset: [-5, -38]
    }),


});
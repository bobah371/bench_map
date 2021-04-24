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

    myMap.geoObjects.add(new ymaps.Placemark([59.929456743379,30.29685707311]))
	myMap.geoObjects.add(new ymaps.Placemark([59.859499709,30.2122011311]));
	myMap.geoObjects.add(new ymaps.Placemark([59.929456743379,30.29685707311]));
});
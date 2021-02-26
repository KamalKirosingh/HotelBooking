mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    //container must match the id of the map in show.ejs
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: hotel.geometry.coordinates, // starting position [longitude, latitude]
    zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

//the marker shown on the map
new mapboxgl.Marker()
    .setLngLat(hotel.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${hotel.title}</h3><p>${hotel.location}</p>`
            )
    )
    .addTo(map)

import { Loader } from '@googlemaps/js-api-loader'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

class MapsService {
  constructor() {
    this.loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry']
    })
    this.google = null
    this.map = null
    this.directionsService = null
    this.directionsRenderer = null
  }

  async initialize() {
    if (!this.google) {
      this.google = await this.loader.load()
      this.directionsService = new this.google.maps.DirectionsService()
      this.directionsRenderer = new this.google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#0ea5e9',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      })
    }
    return this.google
  }

  async createMap(element, options = {}) {
    const google = await this.initialize()
    
    const defaultOptions = {
      zoom: 13,
      center: { lat: 40.7128, lng: -74.0060 }, // NYC default
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    }

    this.map = new google.maps.Map(element, { ...defaultOptions, ...options })
    this.directionsRenderer.setMap(this.map)
    
    return this.map
  }

  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      )
    })
  }

  async geocodeAddress(address) {
    const google = await this.initialize()
    const geocoder = new google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
            formatted_address: results[0].formatted_address
          })
        } else {
          reject(new Error('Geocoding failed'))
        }
      })
    })
  }

  async reverseGeocode(lat, lng) {
    const google = await this.initialize()
    const geocoder = new google.maps.Geocoder()

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve(results[0].formatted_address)
        } else {
          reject(new Error('Reverse geocoding failed'))
        }
      })
    })
  }

  createMarker(position, options = {}) {
    const google = this.google
    if (!google || !this.map) return null

    const defaultOptions = {
      position,
      map: this.map,
      animation: google.maps.Animation.DROP
    }

    return new google.maps.Marker({ ...defaultOptions, ...options })
  }

  async calculateRoute(origin, destination) {
    if (!this.directionsService) return null

    return new Promise((resolve, reject) => {
      this.directionsService.route(
        {
          origin,
          destination,
          travelMode: this.google.maps.TravelMode.DRIVING,
          avoidTolls: true
        },
        (result, status) => {
          if (status === 'OK') {
            resolve(result)
          } else {
            reject(new Error('Directions request failed'))
          }
        }
      )
    })
  }

  displayRoute(route) {
    if (this.directionsRenderer && route) {
      this.directionsRenderer.setDirections(route)
    }
  }

  calculateDistance(point1, point2) {
    if (!this.google) return null

    const distance = this.google.maps.geometry.spherical.computeDistanceBetween(
      new this.google.maps.LatLng(point1.lat, point1.lng),
      new this.google.maps.LatLng(point2.lat, point2.lng)
    )

    return Math.round(distance / 1000 * 100) / 100 // km with 2 decimal places
  }

  fitBounds(bounds) {
    if (this.map && bounds) {
      this.map.fitBounds(bounds)
    }
  }

  createBounds() {
    return new this.google.maps.LatLngBounds()
  }
}

export default new MapsService()
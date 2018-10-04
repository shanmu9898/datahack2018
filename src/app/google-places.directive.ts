/// <reference types="@types/googlemaps" />

import {Directive, ElementRef, EventEmitter, OnInit, Output} from '@angular/core';

@Directive({
  selector: '[google-place]'
})
export class GooglePlacesDirective implements OnInit {
  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  private element: HTMLInputElement;

  constructor(private elRef: ElementRef) {
    // elRef will get a reference to the element where
    // the directive is placed
    this.element = elRef.nativeElement;
  }

  getFormattedAddress(place) {
    const placeProperties = {};
    placeProperties['formatted_address'] = place.formatted_address;
    placeProperties['coords'] = {'lat': place.geometry.location.lat(), 'lng': place.geometry.location.lng()};
    return placeProperties;
  }

  ngOnInit() {
    const autocomplete = new google.maps.places.Autocomplete(this.element);
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      // Emit the new address object for the updated place
      this.onSelect.emit(this.getFormattedAddress(autocomplete.getPlace()));
    });
  }
}

import { TestBed } from '@angular/core/testing';

import { ServerCommunicationService } from './server-communication.service';

describe('ServerCommunicationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServerCommunicationService = TestBed.get(ServerCommunicationService);
    expect(service).toBeTruthy();
  });
});

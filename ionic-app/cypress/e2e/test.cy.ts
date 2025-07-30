/// <reference types="cypress" />

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('h2', 'Capacitor Local Notifications Demo')
  })
})

describe('image', () => {
  beforeEach(() => cy.visit('/iframe.html?id=imagecomponent--primary'));
  it('should render the component', () => {
    cy.get('nge-image').should('exist');
  });
});

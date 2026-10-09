import { render } from './api';

it('renders without crashing', () => {
    const div = document.createElement('div');
    render(div);
    // render() swallows errors into console.error, so assert on actual output
    expect(div.querySelector('.MentalMapper')).not.toBeNull();
});

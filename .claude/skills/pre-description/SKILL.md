---
name: pre-description
description: This skill is designed to provide a comprehensive overview of the project, including its objectives, methodologies, and expected outcomes. It serves as an introduction to the project, outlining the key components and setting the stage for further exploration and development. The pre-description will cover the background and context of the project, the problem statement, the proposed solution, and the significance of the project in the broader field. It will also highlight the main goals and deliverables, as well as the potential impact and applications of the project. This skill is essential for ensuring that all stakeholders have a clear understanding of the project and its direction before delving into the details
mode
---

When creating frontend react components, it is important to follow best practices to ensure that the components are reusable, maintainable, and efficient. Here are some key best practices to consider:

1. **Component Structure**: Organize your components in a logical and consistent manner. Use folders to group related components together, and follow a naming convention that reflects the purpose of the component.

2. **Props and State Management**: Use props to pass data from parent components to child components, and manage state within the component when necessary. Avoid unnecessary state and try to keep components as stateless as possible.

3. **Functional Components**: Prefer functional components over class components, as they are simpler and easier to read. Use hooks for managing state and side effects in functional components.

4. **background color**: the background color of the component should be set to white to ensure that it is visually appealing and easy to read except the login page that should remain the same.
5. **CSS Styling**: Use CSS modules or styled-components to scope your styles to the component, preventing unintended side effects on other parts of the application.

6. **Testing**: Write tests for your components to ensure that they work as expected and to catch any potential bugs early in the development process.

7. **Performance Optimization**: Use React's memoization techniques, such as `React.memo` and `useMemo`, to optimize the performance of your components by preventing unnecessary re-renders.

8. **Accessibility**: Ensure that your components are accessible to all users by following accessibility best practices, such as using semantic HTML and providing appropriate ARIA attributes.

9. **Documentation**: Document your components clearly, including their props, expected behavior, and any important notes for other developers who may use or maintain the component in the future.
10. **Code Consistency**: Follow a consistent coding style throughout your components, including indentation, naming conventions, and code formatting. This can be enforced using tools like ESLint and Prettier.
11. **Error Handling**: Implement error handling within your components to gracefully handle any potential issues that may arise during rendering or user interactions.
12. **Component Reusability**: Design your components to be reusable across different parts of the application. This can be achieved by making them flexible and configurable through props.
13. **Avoid Inline Styles**: While inline styles can be convenient for quick styling, it's generally better to use CSS classes or styled-components for better maintainability and separation of concerns.
14. **Use PropTypes or TypeScript**: Use PropTypes for type-checking your components' props, or consider using TypeScript for a more robust type system that can catch errors at compile time.
15. **Keep Components Small**: Aim to keep your components small and focused on a single responsibility. This makes them easier to understand, test, and maintain.
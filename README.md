# eslint-plugin-drupal

ESLint rules for enforcing Drupal coding standards

Install the eslint plugin:

```
npm install eslint-plugin-drupal
```

And add the plugin to the configuration file: 
 
```
{
  "plugins": ["drupal"],
  "rules": {
    "drupal/jquery-var-name": 2
  }
}
```


# Rules

- [jquery-var-name](docs/rules/jquery-var-name.md): Ensure jquery variables are prefixed with `$`.

# Ressources

- [Drupal JavaScript coding standards](https://www.drupal.org/node/172169)

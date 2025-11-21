# Template filters

## filter `t`

This filter renders an i18n string.

### Parameters

- key __string__ i18n string identifier.
- parameters __(string | number)[]__

### Examples

```handlebars
{{t "moon.label" label=moonname }}
```
Renders the i18n string identified by `moon.label` with a parameter `label`of value `moonname`.


## filter `color`

This filter renders an ANSI color code.

### Parameters

- fg __string__ foreground color code, change color of characters.
- bg __string__ background color code, change color of background.

### Examples

```handlebars
{{color "#fff"}}White text
```


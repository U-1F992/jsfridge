# jsfridge

Convert HTML containing DOM changes at load time with JavaScript to static one with changes applied.

<figure>
<figcaption>input</figcaption>

```html
<html>
<body></body>
<script defer>
    document.body.textContent = "Hello World";
</script>
</html>
```

</figure>

<figure>
<figcaption>output</figcaption>

```html
<html><head></head><body>Hello World

</body></html>
```

</figure>


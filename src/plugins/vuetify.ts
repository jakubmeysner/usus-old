import "@mdi/font/css/materialdesignicons.css"
import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"
import "vuetify/styles"

export default createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: "dark",
        themes: {
            dark: {
                colors: {
                    primary: "#304FFE",
                },
            },
        },
    },
})

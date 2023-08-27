import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

export function useTermId() {
    const router = useRouter()
    const route = useRoute()

    return computed({
        get: () => {
            if (Array.isArray(route.query.termId)) {
                return route.query.termId[0]
            } else {
                return route.query.termId
            }
        },
        set: (value) => {
            if (value === null) {
                router.push({
                    query: {
                        ...route.query,
                        termId: undefined,
                    },
                })
            } else {
                router.push({
                    query: {
                        ...route.query,
                        termId: value,
                    },
                })
            }
        },
    })
}

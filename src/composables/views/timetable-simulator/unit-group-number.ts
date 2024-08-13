import type { Ref } from "vue"
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

const NONE = "none"

export function useUnitGroupNumber(unitId: Ref<string>) {
    const router = useRouter()
    const route = useRoute()

    const queryKey = computed(() => {
        return `unitGroupNumber[${unitId.value}]`
    })

    return computed<number | null>({
        get: () => {
            const value = route.query[queryKey.value]
            const actualValue = Array.isArray(value) ? value[0] : value

            if (actualValue === NONE) {
                return null
            }

            return Number(actualValue ?? 1)
        },
        set: async (value) => {
            await router.replace({
                query: {
                    ...route.query,
                    [queryKey.value]: value === null ? NONE : value,
                },
            })
        },
    })
}

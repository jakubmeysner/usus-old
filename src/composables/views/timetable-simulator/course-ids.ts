import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

export function useCourseIds() {
    const router = useRouter()
    const route = useRoute()

    return computed({
        get: () => {
            const queryCourseIds = route.query.courseIds

            if (Array.isArray(queryCourseIds)) {
                return queryCourseIds[0]?.split(",") ?? []
            } else {
                return queryCourseIds?.split(",") ?? []
            }
        },
        set: (value) => {
            router.replace({
                query: {
                    ...route.query,
                    courseIds: value.join(","),
                },
            })
        },
    })
}

const { createApp, ref } = Vue;

createApp({
	setup() {
		const users = ref([]);
		const supabaseUrl = ref("");
		const supabaseSecretKey = ref("");

		const loadUsers = async () => {
			const supabaseAdmin = supabase.createClient(
				supabaseUrl.value,
				supabaseSecretKey.value
			);
			const { data, error } = await supabaseAdmin.auth.admin.listUsers();
			if (error) {
				return [];
			}
			if (data) {
				users.value = data.users;
			}
		};

		const loginAsUser = async (user) => {
			const supabaseAdmin = supabase.createClient(
				supabaseUrl.value,
				supabaseSecretKey.value
			);
			const { data, error } = await supabaseAdmin.auth.admin.generateLink(
				{
					type: "magiclink",
					email: user.email,
				}
			);
			if (error) {
				console.error(error);
				return;
			}
			if (data) {
				window.open(data.properties.action_link, "_blank");
			}
		};

		return {
			users,
			loadUsers,
			loginAsUser,
			supabaseUrl,
			supabaseSecretKey,
		};
	},
	methods: {
		formatLoginDate(dateString) {
			if (!dateString) {
				return "";
			}
			const date = new Date(dateString);
			return new Intl.DateTimeFormat(navigator.language, {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				timeZoneName: "short",
			}).format(date);
		},
	},
}).mount("#app");

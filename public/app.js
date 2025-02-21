const { createApp, ref } = Vue;

createApp({
	setup() {
		const users = ref([]);
		const supabaseUrl = ref("");
		const supabaseSecretKey = ref("");
		const expandedUsers = ref(new Set());

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

		const isUserExpanded = (user) => expandedUsers.value.has(user.id);

		const toggleUserExpanded = (user) => {
			if (expandedUsers.value.has(user.id)) {
				expandedUsers.value.delete(user.id);
			} else {
				expandedUsers.value.add(user.id);
				// Initialize newEmail when expanding
				user.newEmail = user.email;
			}
		};

		const updateUserEmail = async (user) => {
			const supabaseAdmin = supabase.createClient(
				supabaseUrl.value,
				supabaseSecretKey.value
			);
			
			const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
				user.id,
				{ email: user.newEmail }
			);
			const { data: emailConfirmData, error: emailConfirmError } = await supabaseAdmin.auth.admin.updateUserById(
				user.id,
				{ email_confirm: true }
			);
			
			if (error) {
				console.error(error);
				return;
			}
			
			// Update the user's email in the list
			user.email = user.newEmail;
			// Collapse the expanded section
			expandedUsers.value.delete(user.id);
		};

		return {
			users,
			loadUsers,
			loginAsUser,
			supabaseUrl,
			supabaseSecretKey,
			isUserExpanded,
			toggleUserExpanded,
			updateUserEmail,
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

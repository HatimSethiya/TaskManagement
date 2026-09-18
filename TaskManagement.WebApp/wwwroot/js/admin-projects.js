document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
    ====================================================== */

    const createForm =
        document.getElementById("createProjectForm");

    const modalElement =
        document.getElementById("addProjectModal");

    const saveButton =
        document.getElementById("saveProjectBtn");

    const saveText =
        document.getElementById("saveProjectText");

    const saveSpinner =
        document.getElementById("saveProjectSpinner");

    const errorMessage =
        document.getElementById("projectFormError");

    const successMessage =
        document.getElementById("projectFormSuccess");

    const projectSearch =
        document.getElementById("projectSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const resetFilters =
        document.getElementById("resetFilters");



    /* =====================================================
       ADD PROJECT
    ====================================================== */

    if (createForm) {

        createForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                clearMessages();


                const startDate =
                    document.getElementById("StartDate").value;

                const endDate =
                    document.getElementById("EndDate").value;


                /* Date validation */

                if (
                    startDate &&
                    endDate &&
                    startDate > endDate
                ) {

                    showError(
                        "Start date cannot be later than end date."
                    );

                    return;
                }


                setLoading(true);


                try {

                    const formData =
                        new FormData(createForm);


                    const response =
                        await fetch(
                            createForm.action,
                            {
                                method: "POST",
                                body: formData,
                                headers: {
                                    "X-Requested-With":
                                        "XMLHttpRequest"
                                }
                            }
                        );


                    /*
                     * Backend should return JSON for AJAX.
                     */

                    const contentType =
                        response.headers.get("content-type") || "";


                    if (!contentType.includes("application/json")) {

                        /*
                         * Your current backend redirects after Create.
                         * If backend hasn't been changed for AJAX yet,
                         * fall back safely instead of breaking the page.
                         */

                        if (response.ok) {

                            window.location.reload();

                            return;
                        }


                        throw new Error(
                            "Unexpected server response."
                        );
                    }


                    const result =
                        await response.json();


                    if (!response.ok || !result.success) {

                        showError(
                            result.message ||
                            "Unable to create project."
                        );

                        return;
                    }


                    /* =====================================
                       SUCCESS
                    ====================================== */

                    addProjectToPage(
                        result.project
                    );


                    updateStatistics();


                    showSuccess(
                        result.message ||
                        "Project created successfully."
                    );


                    resetProjectForm();


                    /*
                     * Close modal after a small delay.
                     */

                    setTimeout(function () {

                        const modal =
                            bootstrap.Modal.getInstance(
                                modalElement
                            );

                        if (modal) {
                            modal.hide();
                        }

                        clearMessages();

                    }, 700);


                }
                catch (error) {

                    console.error(
                        "Create project error:",
                        error
                    );

                    showError(
                        "Something went wrong while creating the project."
                    );

                }
                finally {

                    setLoading(false);

                }

            }
        );

    }



    /* =====================================================
       SEARCH
    ====================================================== */

    if (projectSearch) {

        projectSearch.addEventListener(
            "input",
            filterProjects
        );

    }



    /* =====================================================
       STATUS FILTER
    ====================================================== */

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            filterProjects
        );

    }



    /* =====================================================
       RESET FILTERS
    ====================================================== */

    if (resetFilters) {

        resetFilters.addEventListener(
            "click",
            function () {

                projectSearch.value = "";

                statusFilter.value = "";

                filterProjects();

            }
        );

    }



    /* =====================================================
       VIEW PROJECT DETAILS
    ====================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".view-project-btn"
                );


            if (!button) {
                return;
            }


            const projectId =
                button.dataset.projectId;


            showProjectDetails(
                projectId
            );

        }
    );



    /* =====================================================
       MANAGE TASKS
    ====================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".manage-task-btn"
                );


            if (!button) {
                return;
            }


            const projectId =
                button.dataset.projectId;


            /*
             * This will be connected to the Tasks page
             * when your backend teammate completes
             * the Manage Tasks route.
             */

            console.log(
                "Manage Tasks for project:",
                projectId
            );

        }
    );



    /* =====================================================
       MODAL RESET
    ====================================================== */

    if (modalElement) {

        modalElement.addEventListener(
            "hidden.bs.modal",
            function () {

                resetProjectForm();

                clearMessages();

            }
        );

    }



    /* =====================================================
       FUNCTIONS
    ====================================================== */


    function filterProjects() {

        const search =
            projectSearch.value
                .trim()
                .toLowerCase();


        const status =
            statusFilter.value
                .trim()
                .toLowerCase();


        const projects =
            document.querySelectorAll(
                ".project-item"
            );


        let visibleCount = 0;


        projects.forEach(
            function (project) {


                const title =
                    (
                        project.dataset.title || ""
                    ).toLowerCase();


                const description =
                    (
                        project.dataset.description || ""
                    ).toLowerCase();


                const tech =
                    (
                        project.dataset.tech || ""
                    ).toLowerCase();


                const projectStatus =
                    (
                        project.dataset.status || ""
                    ).toLowerCase();


                const matchesSearch =
                    !search ||
                    title.includes(search) ||
                    description.includes(search) ||
                    tech.includes(search);


                const matchesStatus =
                    !status ||
                    projectStatus === status;


                const visible =
                    matchesSearch &&
                    matchesStatus;


                project.style.display =
                    visible ? "flex" : "none";


                if (visible) {
                    visibleCount++;
                }

            }
        );


        updateEmptyFilterMessage(
            visibleCount,
            projects.length
        );

    }



    function updateEmptyFilterMessage(
        visibleCount,
        totalCount
    ) {

        let message =
            document.getElementById(
                "noFilterResults"
            );


        if (
            visibleCount === 0 &&
            totalCount > 0
        ) {

            if (!message) {

                message =
                    document.createElement("div");

                message.id =
                    "noFilterResults";

                message.className =
                    "empty-project-state";

                message.innerHTML = `

                    <div class="empty-project-icon">
                        ⌕
                    </div>

                    <h3>
                        No projects found
                    </h3>

                    <p>
                        Try changing your search or filter.
                    </p>

                `;

                document
                    .getElementById("projectsList")
                    .appendChild(message);

            }

            message.style.display =
                "block";

        }
        else if (message) {

            message.style.display =
                "none";

        }

    }



    function addProjectToPage(project) {

        if (!project) {
            return;
        }


        const container =
            document.getElementById(
                "projectsList"
            );


        const oldEmptyState =
            document.getElementById(
                "emptyProjectState"
            );


        if (oldEmptyState) {
            oldEmptyState.remove();
        }


        const oldFilterMessage =
            document.getElementById(
                "noFilterResults"
            );


        if (oldFilterMessage) {
            oldFilterMessage.remove();
        }


        const initial =
            project.projectTitle
                ? project.projectTitle
                    .charAt(0)
                    .toUpperCase()
                : "P";


        const statusClass =
            getStatusClass(
                project.status
            );


        const techTags =
            createTechTags(
                project.techStack
            );


        const card =
            document.createElement("article");


        card.className =
            "project-item";


        card.dataset.title =
            project.projectTitle || "";


        card.dataset.description =
            project.description || "";


        card.dataset.tech =
            project.techStack || "";


        card.dataset.status =
            project.status || "";


        card.dataset.projectId =
            project.id;


        card.innerHTML = `

            <div class="project-item-left">

                <div class="project-logo">
                    ${escapeHtml(initial)}
                </div>


                <div class="project-details">

                    <h2>
                        ${escapeHtml(project.projectTitle)}
                    </h2>


                    <p class="project-description">

                        ${project.description
                ? escapeHtml(
                    project.description
                )
                : "No description provided for this project."
            }

                    </p>


                    <div class="project-meta">


                        <div class="project-meta-item">

                            <span class="meta-icon">
                                📅
                            </span>

                            <span>

                                <small>
                                    Start Date
                                </small>

                                ${formatDate(project.startDate)}

                            </span>

                        </div>


                        <div class="meta-line"></div>


                        <div class="project-meta-item">

                            <span class="meta-icon">
                                📅
                            </span>

                            <span>

                                <small>
                                    End Date
                                </small>

                                ${formatDate(project.endDate)}

                            </span>

                        </div>


                        <div class="meta-line"></div>


                        <div class="project-meta-item">

                            <span class="meta-icon">
                                👥
                            </span>

                            <span>

                                <small>
                                    Members
                                </small>

                                ${project.membersCount}

                            </span>

                        </div>


                    </div>


                    ${techTags
                ? `
                                <div class="tech-stack-list">
                                    ${techTags}
                                </div>
                              `
                : ""
            }

                </div>

            </div>


            <div class="project-item-right">


                <div class="project-status-wrapper">

                    <span class="status-title">
                        Status
                    </span>

                    <span class="project-status ${statusClass}">
                        ${escapeHtml(project.status)}
                    </span>

                </div>


                <div class="project-actions">


                    <button type="button"
                            class="project-action-btn view-project-btn"
                            data-project-id="${project.id}">

                        <span>
                            ◉
                        </span>

                        View Details

                    </button>


                    <button type="button"
                            class="project-action-btn manage-task-btn"
                            data-project-id="${project.id}">

                        <span>
                            ☷
                        </span>

                        Manage Tasks

                    </button>


                    <button type="button"
                            class="project-more-btn"
                            data-project-id="${project.id}">

                        ⋮

                    </button>


                </div>


            </div>

        `;


        container.prepend(card);

    }



    function createTechTags(
        techStack
    ) {

        if (!techStack) {
            return "";
        }


        return techStack
            .split(",")
            .map(
                function (tech) {

                    const cleanTech =
                        tech.trim();


                    if (!cleanTech) {
                        return "";
                    }


                    return `
                        <span class="tech-tag">
                            ${escapeHtml(cleanTech)}
                        </span>
                    `;

                }
            )
            .join("");

    }



    function updateStatistics() {

        const projects =
            document.querySelectorAll(
                ".project-item"
            );


        let active = 0;

        let inProgress = 0;

        let completed = 0;


        projects.forEach(
            function (project) {

                const status =
                    (
                        project.dataset.status ||
                        ""
                    ).toLowerCase();


                if (status === "active") {
                    active++;
                }


                if (
                    status === "in progress"
                ) {
                    inProgress++;
                }


                if (
                    status === "completed"
                ) {
                    completed++;
                }

            }
        );


        const totalElement =
            document.getElementById(
                "totalProjects"
            );


        const activeElement =
            document.getElementById(
                "activeProjects"
            );


        const progressElement =
            document.getElementById(
                "inProgressProjects"
            );


        const completedElement =
            document.getElementById(
                "completedProjects"
            );


        if (totalElement) {
            totalElement.textContent =
                projects.length;
        }


        if (activeElement) {
            activeElement.textContent =
                active;
        }


        if (progressElement) {
            progressElement.textContent =
                inProgress;
        }


        if (completedElement) {
            completedElement.textContent =
                completed;
        }

    }



    async function showProjectDetails(
        projectId
    ) {

        try {

            /*
             * Uses the existing GetProject endpoint
             * if your backend teammate has added it.
             */

            const response =
                await fetch(
                    `/Admin/Projects/GetProject?id=${encodeURIComponent(projectId)}`
                );


            if (!response.ok) {

                /*
                 * Fallback:
                 * get information directly from card.
                 */

                showDetailsFromCard(
                    projectId
                );

                return;

            }


            const project =
                await response.json();


            fillDetailsModal(
                project
            );


        }
        catch (error) {

            console.error(
                "Project details error:",
                error
            );


            showDetailsFromCard(
                projectId
            );

        }

    }



    function showDetailsFromCard(
        projectId
    ) {

        const card =
            document.querySelector(
                `.project-item[data-project-id="${projectId}"]`
            );


        if (!card) {
            return;
        }


        const title =
            card.dataset.title || "";


        const description =
            card.dataset.description || "";


        const tech =
            card.dataset.tech || "";


        const status =
            card.dataset.status || "";


        const dateElements =
            card.querySelectorAll(
                ".project-meta-item"
            );


        let startDate = "-";

        let endDate = "-";

        let members = "-";


        if (dateElements.length >= 3) {

            startDate =
                dateElements[0]
                    .querySelector("span:last-child")
                    ?.textContent
                    .trim() || "-";


            endDate =
                dateElements[1]
                    .querySelector("span:last-child")
                    ?.textContent
                    .trim() || "-";


            members =
                dateElements[2]
                    .querySelector("span:last-child")
                    ?.textContent
                    .trim() || "-";

        }


        fillDetailsModal({

            projectTitle: title,

            description: description,

            techStack: tech,

            status: status,

            startDate: startDate,

            endDate: endDate,

            membersCount: members

        });

    }



    function fillDetailsModal(
        project
    ) {

        document.getElementById(
            "detailsProjectTitle"
        ).textContent =
            project.projectTitle || "Project Details";


        document.getElementById(
            "detailsProjectStatus"
        ).textContent =
            project.status || "";


        document.getElementById(
            "detailsDescription"
        ).textContent =
            project.description ||
            "No description available.";


        document.getElementById(
            "detailsTechStack"
        ).textContent =
            project.techStack ||
            "Not specified";


        document.getElementById(
            "detailsStartDate"
        ).textContent =
            formatDate(
                project.startDate
            );


        document.getElementById(
            "detailsEndDate"
        ).textContent =
            formatDate(
                project.endDate
            );


        document.getElementById(
            "detailsMembers"
        ).textContent =
            project.membersCount ?? "-";


        document.getElementById(
            "detailsStatus"
        ).textContent =
            project.status ||
            "-";


        const detailsModalElement =
            document.getElementById(
                "projectDetailsModal"
            );


        const detailsModal =
            bootstrap.Modal.getOrCreateInstance(
                detailsModalElement
            );


        detailsModal.show();

    }



    function resetProjectForm() {

        if (!createForm) {
            return;
        }


        createForm.reset();


        document.getElementById(
            "Status"
        ).value = "Planning";


        document.getElementById(
            "MembersCount"
        ).value = "1";

    }



    function setLoading(
        loading
    ) {

        if (!saveButton) {
            return;
        }


        saveButton.disabled =
            loading;


        if (saveText) {

            saveText.style.display =
                loading
                    ? "none"
                    : "inline";

        }


        if (saveSpinner) {

            saveSpinner.style.display =
                loading
                    ? "inline-block"
                    : "none";

        }

    }



    function showError(
        message
    ) {

        if (!errorMessage) {
            return;
        }


        errorMessage.textContent =
            message;


        errorMessage.style.display =
            "block";

    }



    function showSuccess(
        message
    ) {

        if (!successMessage) {
            return;
        }


        successMessage.textContent =
            message;


        successMessage.style.display =
            "block";

    }



    function clearMessages() {

        if (errorMessage) {

            errorMessage.textContent =
                "";

            errorMessage.style.display =
                "none";

        }


        if (successMessage) {

            successMessage.textContent =
                "";

            successMessage.style.display =
                "none";

        }

    }



    function formatDate(
        value
    ) {

        if (!value) {
            return "-";
        }


        /*
         * Handles both:
         * 2026-09-18
         * 2026-09-18T00:00:00
         */

        const date =
            new Date(value);


        if (Number.isNaN(
            date.getTime()
        )) {

            return value;

        }


        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }



    function getStatusClass(
        status
    ) {

        return String(
            status || "Planning"
        )
            .toLowerCase()
            .replaceAll(" ", "-");

    }



    function escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

});
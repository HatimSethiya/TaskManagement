document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       COMMON ELEMENTS
    ====================================================== */

    const createForm =
        document.getElementById("createProjectForm");

    const addProjectModal =
        document.getElementById("addProjectModal");

    const projectSearch =
        document.getElementById("projectSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const resetFilters =
        document.getElementById("resetFilters");

    const projectList =
        document.getElementById("projectsList");


    /* =====================================================
       CREATE PROJECT
    ====================================================== */

    if (createForm) {

        createForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                clearMessages();

                const startDate =
                    document.getElementById("StartDate")?.value;

                const endDate =
                    document.getElementById("EndDate")?.value;

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

                const submitButton =
                    createForm.querySelector(
                        'button[type="submit"]'
                    );

                if (submitButton) {
                    submitButton.disabled = true;
                }

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

                    const contentType =
                        response.headers.get(
                            "content-type"
                        ) || "";

                    if (
                        !contentType.includes(
                            "application/json"
                        )
                    ) {

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

                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        showError(
                            result.message ||
                            "Unable to create project."
                        );

                        return;
                    }

                    /*
                     * Refresh only the project section.
                     * Full page reload is avoided.
                     */

                    await refreshProjectsFragment();

                    resetCreateForm();

                    showSuccess(
                        result.message ||
                        "Project created successfully."
                    );

                    setTimeout(function () {

                        if (
                            addProjectModal &&
                            typeof bootstrap !== "undefined"
                        ) {

                            const modal =
                                bootstrap.Modal
                                    .getInstance(
                                        addProjectModal
                                    );

                            if (modal) {
                                modal.hide();
                            }
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

                    if (submitButton) {
                        submitButton.disabled = false;
                    }

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

                if (projectSearch) {
                    projectSearch.value = "";
                }

                if (statusFilter) {
                    statusFilter.value = "";
                }

                filterProjects();

            }
        );

    }


    /* =====================================================
       VIEW PROJECT DETAILS
    ====================================================== */

    document.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    ".view-project-btn"
                );

            if (!button) {
                return;
            }

            const projectId =
                button.dataset.projectId;

            if (!projectId) {
                return;
            }

            const article =
                button.closest(
                    ".project-item"
                );

            if (!article) {
                return;
            }

            /*
             * Toggle existing details.
             */

            const existingDetails =
                article.nextElementSibling;

            if (
                existingDetails &&
                existingDetails.classList.contains(
                    "project-expanded-details"
                )
            ) {

                existingDetails.remove();

                return;
            }

            /*
             * Close any other expanded details.
             */

            document
                .querySelectorAll(
                    ".project-expanded-details"
                )
                .forEach(function (element) {

                    element.remove();

                });

            try {

                const response =
                    await fetch(
                        "/Admin/Projects/Details?id=" +
                        encodeURIComponent(projectId)
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    alert(
                        result.message ||
                        "Unable to load project details."
                    );

                    return;
                }

                const project =
                    result.data;

                const detailsContainer =
                    document.createElement(
                        "div"
                    );

                detailsContainer.className =
                    "project-expanded-details";

                detailsContainer.innerHTML = `

                    <div class="project-details-expanded-card">

                        <div class="details-row">

                            <div>
                                <strong>
                                    Description
                                </strong>

                                <p>
                                    ${escapeHtml(
                    project.description ||
                    "No description provided."
                )
                    }
                                </p>
                            </div>


                            <div>
                                <strong>
                                    Tech Stack
                                </strong>

                                <p>
                                    ${escapeHtml(
                        project.techStack ||
                        "-"
                    )
                    }
                                </p>
                            </div>


                            <div>
                                <strong>
                                    Start Date
                                </strong>

                                <p>
                                    ${formatDate(
                        project.startDate
                    )
                    }
                                </p>
                            </div>


                            <div>
                                <strong>
                                    End Date
                                </strong>

                                <p>
                                    ${formatDate(
                        project.endDate
                    )
                    }
                                </p>
                            </div>


                            <div>
                                <strong>
                                    Members
                                </strong>

                                <p>
                                    ${project.membersCount ??
                    "-"
                    }
                                </p>
                            </div>


                            <div>
                                <strong>
                                    Status
                                </strong>

                                <p>
                                    ${escapeHtml(
                        project.status ||
                        "-"
                    )
                    }
                                </p>
                            </div>

                        </div>

                    </div>

                `;

                article.insertAdjacentElement(
                    "afterend",
                    detailsContainer
                );

            }
            catch (error) {

                console.error(
                    "Project details error:",
                    error
                );

                alert(
                    "Unable to load project details."
                );

            }

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

            if (!projectId) {
                return;
            }

            window.location.href =
                "/Admin/Tasks/Project/" +
                encodeURIComponent(projectId);

        }
    );


    /* =====================================================
       MORE BUTTON
       EDIT / DELETE
    ====================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const moreButton =
                event.target.closest(
                    ".project-more-btn"
                );

            if (!moreButton) {
                return;
            }

            event.stopPropagation();

            /*
             * Remove existing menus.
             */

            document
                .querySelectorAll(
                    ".project-more-menu"
                )
                .forEach(function (menu) {

                    menu.remove();

                });

            const projectId =
                moreButton.dataset.projectId;

            if (!projectId) {
                return;
            }

            const rect =
                moreButton.getBoundingClientRect();

            const menu =
                document.createElement("div");

            menu.className =
                "project-more-menu";

            menu.style.position = "absolute";
            menu.style.left =
                (
                    rect.left +
                    window.scrollX
                ) + "px";

            menu.style.top =
                (
                    rect.bottom +
                    window.scrollY +
                    8
                ) + "px";

            menu.style.background =
                "#ffffff";

            menu.style.border =
                "1px solid #ddd";

            menu.style.padding =
                "6px";

            menu.style.zIndex =
                "2000";

            menu.innerHTML = `

                <button
                    type="button"
                    class="btn btn-link project-action-edit"
                    data-project-id="${escapeHtml(projectId)}">

                    Edit

                </button>


                <button
                    type="button"
                    class="btn btn-link text-danger project-action-delete"
                    data-project-id="${escapeHtml(projectId)}">

                    Delete

                </button>

            `;

            document.body.appendChild(menu);


            /*
             * Close menu when clicking outside.
             */

            setTimeout(function () {

                document.addEventListener(
                    "click",
                    function closeMenu(event) {

                        if (
                            !menu.contains(
                                event.target
                            ) &&
                            event.target !==
                            moreButton
                        ) {

                            menu.remove();

                            document.removeEventListener(
                                "click",
                                closeMenu
                            );

                        }

                    }
                );

            }, 0);

        }
    );


    /* =====================================================
       EDIT PROJECT
    ====================================================== */

    document.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    ".project-action-edit"
                );

            if (!button) {
                return;
            }

            const projectId =
                button.dataset.projectId;

            if (!projectId) {
                return;
            }

            document
                .querySelectorAll(
                    ".project-more-menu"
                )
                .forEach(function (menu) {
                    menu.remove();
                });

            try {

                const response =
                    await fetch(
                        "/Admin/Projects/GetById?id=" +
                        encodeURIComponent(projectId)
                    );

                if (!response.ok) {

                    alert(
                        "Unable to load project for editing."
                    );

                    return;
                }

                const project =
                    await response.json();

                if (!project) {

                    alert(
                        "Project not found."
                    );

                    return;
                }

                setInputValue(
                    "EditId",
                    project.id
                );

                setInputValue(
                    "EditProjectTitle",
                    project.projectTitle
                );

                setInputValue(
                    "EditDescription",
                    project.description
                );

                setInputValue(
                    "EditTechStack",
                    project.techStack
                );

                setInputValue(
                    "EditStatus",
                    project.status
                );

                setInputValue(
                    "EditMembersCount",
                    project.membersCount
                );

                setInputValue(
                    "EditStartDate",
                    formatInputDate(
                        project.startDate
                    )
                );

                setInputValue(
                    "EditEndDate",
                    formatInputDate(
                        project.endDate
                    )
                );

                const editModal =
                    document.getElementById(
                        "editProjectModal"
                    );

                if (
                    editModal &&
                    typeof bootstrap !== "undefined"
                ) {

                    bootstrap.Modal
                        .getOrCreateInstance(
                            editModal
                        )
                        .show();

                }

            }
            catch (error) {

                console.error(
                    "Edit project load error:",
                    error
                );

                alert(
                    "Unable to load project for editing."
                );

            }

        }
    );


    /* =====================================================
       UPDATE PROJECT
    ====================================================== */

    const editForm =
        document.getElementById(
            "editProjectForm"
        );

    if (editForm) {

        editForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                const submitButton =
                    editForm.querySelector(
                        'button[type="submit"]'
                    );

                if (submitButton) {
                    submitButton.disabled = true;
                }

                try {

                    const formData =
                        new FormData(editForm);

                    const response =
                        await fetch(
                            editForm.action,
                            {
                                method: "POST",
                                body: formData,
                                headers: {
                                    "X-Requested-With":
                                        "XMLHttpRequest"
                                }
                            }
                        );

                    const contentType =
                        response.headers.get(
                            "content-type"
                        ) || "";

                    if (
                        !contentType.includes(
                            "application/json"
                        )
                    ) {

                        if (response.ok) {
                            await refreshProjectsFragment();
                            closeModal(
                                "editProjectModal"
                            );
                            return;
                        }

                        throw new Error(
                            "Unexpected server response."
                        );
                    }

                    const result =
                        await response.json();

                    if (
                        !response.ok ||
                        !result.success
                    ) {

                        alert(
                            result.message ||
                            "Unable to update project."
                        );

                        return;
                    }

                    await refreshProjectsFragment();

                    closeModal(
                        "editProjectModal"
                    );

                }
                catch (error) {

                    console.error(
                        "Update project error:",
                        error
                    );

                    alert(
                        "Something went wrong while updating the project."
                    );

                }
                finally {

                    if (submitButton) {
                        submitButton.disabled = false;
                    }

                }

            }
        );

    }


    /* =====================================================
       DELETE PROJECT
    ====================================================== */

    document.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    ".project-action-delete"
                );

            if (!button) {
                return;
            }

            const projectId =
                button.dataset.projectId;

            if (!projectId) {
                return;
            }

            document
                .querySelectorAll(
                    ".project-more-menu"
                )
                .forEach(function (menu) {
                    menu.remove();
                });

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this project?"
                );

            if (!confirmed) {
                return;
            }

            try {

                const token =
                    getAntiForgeryToken(
                        "createProjectForm"
                    );

                const formData =
                    new FormData();

                if (token) {

                    formData.append(
                        "__RequestVerificationToken",
                        token
                    );

                }

                formData.append(
                    "id",
                    projectId
                );

                const response =
                    await fetch(
                        "/Admin/Projects/Delete",
                        {
                            method: "POST",
                            body: formData,
                            headers: {
                                "X-Requested-With":
                                    "XMLHttpRequest"
                            }
                        }
                    );

                const result =
                    await response.json();

                if (
                    !response.ok ||
                    !result.success
                ) {

                    alert(
                        result.message ||
                        "Unable to delete project."
                    );

                    return;
                }

                await refreshProjectsFragment();

            }
            catch (error) {

                console.error(
                    "Delete project error:",
                    error
                );

                alert(
                    "Something went wrong while deleting the project."
                );

            }

        }
    );


    /* =====================================================
       MODAL RESET
    ====================================================== */

    if (addProjectModal) {

        addProjectModal.addEventListener(
            "hidden.bs.modal",
            function () {

                resetCreateForm();

                clearMessages();

            }
        );

    }


    /* =====================================================
       FUNCTIONS
    ====================================================== */


    function filterProjects() {

        if (!projectList) {
            return;
        }

        const search =
            (
                projectSearch?.value ||
                ""
            )
                .trim()
                .toLowerCase();

        const status =
            (
                statusFilter?.value ||
                ""
            )
                .trim()
                .toLowerCase();

        const projects =
            projectList.querySelectorAll(
                ".project-item"
            );

        let visibleCount = 0;

        projects.forEach(
            function (project) {

                const title =
                    (
                        project.dataset.title ||
                        ""
                    ).toLowerCase();

                const description =
                    (
                        project.dataset.description ||
                        ""
                    ).toLowerCase();

                const tech =
                    (
                        project.dataset.tech ||
                        ""
                    ).toLowerCase();

                const projectStatus =
                    (
                        project.dataset.status ||
                        ""
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
                    visible
                        ? "flex"
                        : "none";

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
                    document.createElement(
                        "div"
                    );

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

                if (projectList) {
                    projectList.appendChild(
                        message
                    );
                }

            }

            message.style.display =
                "block";

        }
        else if (message) {

            message.style.display =
                "none";

        }

    }


    async function refreshProjectsFragment() {

        try {

            const response =
                await fetch(
                    window.location.href,
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Unable to refresh projects."
                );
            }

            const html =
                await response.text();

            const parser =
                new DOMParser();

            const documentFragment =
                parser.parseFromString(
                    html,
                    "text/html"
                );

            const newProjectList =
                documentFragment.getElementById(
                    "projectsList"
                );

            const currentProjectList =
                document.getElementById(
                    "projectsList"
                );

            if (
                newProjectList &&
                currentProjectList
            ) {

                currentProjectList.innerHTML =
                    newProjectList.innerHTML;

            }

            /*
             * Update statistics.
             */

            const statisticIds = [
                "totalProjects",
                "activeProjects",
                "inProgressProjects",
                "completedProjects"
            ];

            statisticIds.forEach(
                function (id) {

                    const newElement =
                        documentFragment.getElementById(
                            id
                        );

                    const currentElement =
                        document.getElementById(
                            id
                        );

                    if (
                        newElement &&
                        currentElement
                    ) {

                        currentElement.textContent =
                            newElement.textContent;

                    }

                }
            );

            /*
             * Re-apply current filters.
             */

            filterProjects();

        }
        catch (error) {

            console.error(
                "Refresh projects error:",
                error
            );

            window.location.reload();

        }

    }


    function resetCreateForm() {

        if (!createForm) {
            return;
        }

        createForm.reset();

        const status =
            document.getElementById(
                "Status"
            );

        if (status) {
            status.value =
                "Planning";
        }

        const membersCount =
            document.getElementById(
                "MembersCount"
            );

        if (membersCount) {
            membersCount.value =
                "1";
        }

    }


    function closeModal(
        modalId
    ) {

        const modalElement =
            document.getElementById(
                modalId
            );

        if (
            modalElement &&
            typeof bootstrap !== "undefined"
        ) {

            const modal =
                bootstrap.Modal
                    .getInstance(
                        modalElement
                    );

            if (modal) {
                modal.hide();
            }

        }

    }


    function setInputValue(
        id,
        value
    ) {

        const element =
            document.getElementById(id);

        if (element) {

            element.value =
                value ?? "";

        }

    }


    function getAntiForgeryToken(
        formId
    ) {

        const form =
            document.getElementById(
                formId
            );

        if (!form) {
            return "";
        }

        const token =
            form.querySelector(
                'input[name="__RequestVerificationToken"]'
            );

        return token
            ? token.value
            : "";

    }


    function showError(
        message
    ) {

        const element =
            document.getElementById(
                "projectFormError"
            );

        if (!element) {
            return;
        }

        element.textContent =
            message;

        element.style.display =
            "block";

    }


    function showSuccess(
        message
    ) {

        const element =
            document.getElementById(
                "projectFormSuccess"
            );

        if (!element) {
            return;
        }

        element.textContent =
            message;

        element.style.display =
            "block";

    }


    function clearMessages() {

        const error =
            document.getElementById(
                "projectFormError"
            );

        const success =
            document.getElementById(
                "projectFormSuccess"
            );

        if (error) {

            error.textContent =
                "";

            error.style.display =
                "none";

        }

        if (success) {

            success.textContent =
                "";

            success.style.display =
                "none";

        }

    }


    function formatDate(
        value
    ) {

        if (!value) {
            return "-";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

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


    function formatInputDate(
        value
    ) {

        if (!value) {
            return "";
        }

        /*
         * Handles:
         * 2026-09-18
         * 2026-09-18T00:00:00
         */

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value)
                .substring(0, 10);

        }

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    function getStatusClass(
        status
    ) {

        return String(
            status || "Planning"
        )
            .toLowerCase()
            .replaceAll(
                " ",
                "-"
            );

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
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }

});
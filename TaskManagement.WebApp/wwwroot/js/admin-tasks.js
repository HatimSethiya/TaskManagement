(function () {
    'use strict';

    const projectId = Number(
        document.getElementById('addTaskBtn')?.getAttribute('data-project-id') || 0
    );

    /*
     * ---------------------------------------------------------
     * COMMON HELPERS
     * ---------------------------------------------------------
     */

    function getAntiForgeryToken() {
        return document.querySelector(
            'input[name="__RequestVerificationToken"]'
        )?.value || '';
    }

    function showError(elementId, message) {
        const element = document.getElementById(elementId);

        if (!element) {
            return;
        }

        element.textContent = message || 'Something went wrong.';
        element.style.display = 'block';
    }

    function hideError(elementId) {
        const element = document.getElementById(elementId);

        if (!element) {
            return;
        }

        element.textContent = '';
        element.style.display = 'none';
    }

    function formatDateForInput(value) {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toISOString().substring(0, 10);
    }

    async function readJsonResponse(response) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    /*
     * ---------------------------------------------------------
     * LOAD PROJECT MEMBERS
     * ---------------------------------------------------------
     */

    async function loadMembers(selectElement) {
        if (!selectElement || !projectId) {
            return;
        }

        selectElement.innerHTML = '';

        try {
            const response = await fetch(
                '/Admin/Tasks/Members?projectId=' +
                encodeURIComponent(projectId),
                {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                }
            );

            const data = await readJsonResponse(response);

            if (!response.ok || !data || !data.success) {
                return;
            }

            if (!Array.isArray(data.data)) {
                return;
            }

            data.data.forEach(function (member) {
                const option = document.createElement('option');

                option.value = member.userId;
                option.textContent =
                    member.fullName ||
                    member.email ||
                    member.userId;

                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Unable to load project members:', error);
        }
    }

    /*
     * ---------------------------------------------------------
     * ADD TASK
     * ---------------------------------------------------------
     */

    const addTaskButton = document.getElementById('addTaskBtn');
    const addTaskForm = document.getElementById('addTaskForm');
    const addAssignedTo = document.getElementById('addAssignedTo');

    addTaskButton?.addEventListener('click', function () {
        hideError('addTaskError');

        loadMembers(addAssignedTo);
    });

    addTaskForm?.addEventListener('submit', async function (event) {
        event.preventDefault();

        hideError('addTaskError');

        const submitButton = addTaskForm.querySelector(
            'button[type="submit"]'
        );

        const originalText = submitButton?.textContent;

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Saving...';
        }

        try {
            const formData = new FormData(addTaskForm);

            const response = await fetch(
                addTaskForm.getAttribute('action'),
                {
                    method: 'POST',
                    headers: {
                        'RequestVerificationToken':
                            getAntiForgeryToken(),
                        'X-Requested-With':
                            'XMLHttpRequest'
                    },
                    body: formData
                }
            );

            const data = await readJsonResponse(response);

            if (response.ok && data && data.success) {

                const modalElement =
                    document.getElementById('addTaskModal');

                const modal =
                    bootstrap.Modal.getInstance(modalElement);

                modal?.hide();

                window.location.reload();

                return;
            }

            showError(
                'addTaskError',
                data?.message || 'Unable to create task.'
            );

        } catch (error) {
            console.error('Add task error:', error);

            showError(
                'addTaskError',
                'Unable to create task.'
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent =
                    originalText || 'Save Task';
            }
        }
    });

    /*
     * ---------------------------------------------------------
     * EDIT TASK
     * ---------------------------------------------------------
     */

    document.addEventListener('click', async function (event) {

        const button =
            event.target.closest('.task-edit-btn');

        if (!button) {
            return;
        }

        const taskId =
            button.getAttribute('data-task-id');

        if (!taskId) {
            return;
        }

        try {
            const response = await fetch(
                '/Admin/Tasks/Get?id=' +
                encodeURIComponent(taskId),
                {
                    method: 'GET',
                    headers: {
                        'X-Requested-With':
                            'XMLHttpRequest'
                    }
                }
            );

            if (!response.ok) {
                alert('Unable to load task.');
                return;
            }

            const task = await readJsonResponse(response);

            if (!task) {
                alert('Task not found.');
                return;
            }

            document.getElementById('editTaskId').value =
                task.id;

            document.getElementById('editTitle').value =
                task.title || '';

            document.getElementById('editScenario').value =
                task.scenario || '';

            document.getElementById('editPriority').value =
                task.priority || 'Low';

            document.getElementById('editStatus').value =
                task.status || 'Pending';

            document.getElementById('editStartDate').value =
                formatDateForInput(task.startDate);

            document.getElementById('editExpectedEndDate').value =
                formatDateForInput(task.expectedEndDate);

            document.getElementById('editAmount').value =
                task.amount ?? '';

            const editAssignedTo =
                document.getElementById('editAssignedTo');

            await loadMembers(editAssignedTo);

            editAssignedTo.value =
                task.assignedToUserId || '';

            hideError('editTaskError');

            const modalElement =
                document.getElementById('editTaskModal');

            const modal =
                bootstrap.Modal.getOrCreateInstance(
                    modalElement
                );

            modal.show();

        } catch (error) {
            console.error('Edit task load error:', error);

            alert('Unable to load task.');
        }
    });

    /*
     * ---------------------------------------------------------
     * UPDATE TASK
     * ---------------------------------------------------------
     */

    const editTaskForm =
        document.getElementById('editTaskForm');

    editTaskForm?.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();

            hideError('editTaskError');

            const submitButton =
                editTaskForm.querySelector(
                    'button[type="submit"]'
                );

            const originalText =
                submitButton?.textContent;

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Saving...';
            }

            try {
                const formData =
                    new FormData(editTaskForm);

                const response = await fetch(
                    editTaskForm.getAttribute('action'),
                    {
                        method: 'POST',
                        headers: {
                            'RequestVerificationToken':
                                getAntiForgeryToken(),
                            'X-Requested-With':
                                'XMLHttpRequest'
                        },
                        body: formData
                    }
                );

                const data =
                    await readJsonResponse(response);

                if (response.ok &&
                    data &&
                    data.success) {

                    const modalElement =
                        document.getElementById(
                            'editTaskModal'
                        );

                    const modal =
                        bootstrap.Modal.getInstance(
                            modalElement
                        );

                    modal?.hide();

                    window.location.reload();

                    return;
                }

                showError(
                    'editTaskError',
                    data?.message ||
                    'Unable to update task.'
                );

            } catch (error) {
                console.error(
                    'Update task error:',
                    error
                );

                showError(
                    'editTaskError',
                    'Unable to update task.'
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent =
                        originalText || 'Save';
                }
            }
        }
    );

    /*
     * ---------------------------------------------------------
     * TASK DETAILS
     * ---------------------------------------------------------
     */

    document.addEventListener('click', async function (event) {

        const button =
            event.target.closest('.task-details-btn');

        if (!button) {
            return;
        }

        const taskId =
            button.getAttribute('data-task-id');

        const currentRow =
            button.closest('tr');

        if (!currentRow || !taskId) {
            return;
        }

        const existingRow =
            currentRow.nextElementSibling;

        if (
            existingRow &&
            existingRow.classList.contains('task-expanded')
        ) {
            existingRow.remove();
            return;
        }

        try {
            const response = await fetch(
                '/Admin/Tasks/Details?id=' +
                encodeURIComponent(taskId),
                {
                    method: 'GET',
                    headers: {
                        'X-Requested-With':
                            'XMLHttpRequest'
                    }
                }
            );

            const data =
                await readJsonResponse(response);

            if (
                !response.ok ||
                !data ||
                !data.success
            ) {
                alert(
                    data?.message ||
                    'Unable to load details.'
                );

                return;
            }

            const task = data.data;

            const expandedRow =
                document.createElement('tr');

            expandedRow.className =
                'task-expanded';

            const cell =
                document.createElement('td');

            cell.colSpan = 8;

            const container =
                document.createElement('div');

            const scenarioTitle =
                document.createElement('strong');

            scenarioTitle.textContent =
                'Scenario:';

            const scenario =
                document.createElement('p');

            scenario.textContent =
                task.scenario || '-';

            const assignedTitle =
                document.createElement('strong');

            assignedTitle.textContent =
                'Assigned To:';

            const assigned =
                document.createElement('p');

            assigned.textContent =
                task.assignedToUserId || '-';

            const amountTitle =
                document.createElement('strong');

            amountTitle.textContent =
                'Amount:';

            const amount =
                document.createElement('p');

            amount.textContent =
                task.amount ?? '0.00';

            container.appendChild(scenarioTitle);
            container.appendChild(scenario);

            container.appendChild(assignedTitle);
            container.appendChild(assigned);

            container.appendChild(amountTitle);
            container.appendChild(amount);

            cell.appendChild(container);
            expandedRow.appendChild(cell);

            currentRow.parentNode.insertBefore(
                expandedRow,
                currentRow.nextSibling
            );

        } catch (error) {
            console.error(
                'Task details error:',
                error
            );

            alert('Unable to load details.');
        }
    });

    /*
     * ---------------------------------------------------------
     * DELETE TASK
     * ---------------------------------------------------------
     */

    document.addEventListener('click', async function (event) {

        const button =
            event.target.closest('.task-delete-btn');

        if (!button) {
            return;
        }

        const taskId =
            button.getAttribute('data-task-id');

        if (!taskId) {
            return;
        }

        const confirmed =
            window.confirm(
                'Are you sure you want to delete this task?'
            );

        if (!confirmed) {
            return;
        }

        try {
            const body =
                'id=' +
                encodeURIComponent(taskId) +
                '&projectId=' +
                encodeURIComponent(projectId);

            const response = await fetch(
                '/Admin/Tasks/Delete',
                {
                    method: 'POST',
                    headers: {
                        'RequestVerificationToken':
                            getAntiForgeryToken(),
                        'X-Requested-With':
                            'XMLHttpRequest',
                        'Content-Type':
                            'application/x-www-form-urlencoded'
                    },
                    body: body
                }
            );

            const data =
                await readJsonResponse(response);

            if (
                response.ok &&
                data &&
                data.success
            ) {
                window.location.reload();
                return;
            }

            alert(
                data?.message ||
                'Unable to delete task.'
            );

        } catch (error) {
            console.error(
                'Delete task error:',
                error
            );

            alert('Unable to delete task.');
        }
    });

})();